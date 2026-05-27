import { z } from "zod";
import { anthropic, MODELS, requireApiKey } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";
import { getRubric } from "@/lib/rubrics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const authedBodySchema = z.object({
  projectId: z.string().uuid(),
  stageNumber: z.number().int().min(1).max(9),
  message: z.string().min(1).max(10_000),
});

const guestBodySchema = z.object({
  stageNumber: z.number().int().min(1).max(9),
  message: z.string().min(1).max(10_000),
  /** Full conversation history kept client-side. */
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(50)
    .default([]),
});

type StoredMessage = { role: "user" | "assistant"; content: string; ts: string };

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  if (json && typeof json === "object" && !("projectId" in json)) {
    return handleGuest(request, json);
  }

  return handleAuthed(request, json);
}

async function handleGuest(request: Request, json: unknown) {
  const parsed = guestBodySchema.safeParse(json);
  if (!parsed.success) return new Response("Invalid request", { status: 400 });

  const ip = getClientIp(request);
  const limit = checkRateLimit({
    key: `chat:${ip}`,
    max: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return new Response(
      "Hit the demo's hourly chat limit. Sign in to keep going.",
      { status: 429 }
    );
  }

  const { stageNumber, message, history } = parsed.data;
  return streamChat(stageNumber, [...history, { role: "user", content: message }]);
}

async function handleAuthed(_request: Request, json: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Not authenticated", { status: 401 });

  const parsed = authedBodySchema.safeParse(json);
  if (!parsed.success) return new Response("Invalid request", { status: 400 });
  const { projectId, stageNumber, message } = parsed.data;

  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .single();
  if (!project || project.user_id !== user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const { data: chatRow } = await supabase
    .from("stage_chats")
    .select("messages")
    .eq("project_id", projectId)
    .eq("stage_number", stageNumber)
    .maybeSingle();
  const history: StoredMessage[] = (chatRow?.messages as StoredMessage[]) ?? [];
  const userMsg: StoredMessage = {
    role: "user",
    content: message,
    ts: new Date().toISOString(),
  };
  const updatedHistory = [...history, userMsg];

  return streamChat(
    stageNumber,
    updatedHistory.map((m) => ({ role: m.role, content: m.content })),
    async (assistantText: string) => {
      const finalHistory = [
        ...updatedHistory,
        {
          role: "assistant" as const,
          content: assistantText,
          ts: new Date().toISOString(),
        },
      ];
      await supabase.from("stage_chats").upsert(
        {
          project_id: projectId,
          stage_number: stageNumber,
          messages: finalHistory,
        },
        { onConflict: "project_id,stage_number" }
      );
    }
  );
}

function streamChat(
  stageNumber: number,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onComplete?: (assistantText: string) => Promise<void>
) {
  requireApiKey();
  const rubric = getRubric(stageNumber);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let assistantText = "";
      try {
        const apiStream = anthropic.messages.stream({
          model: MODELS.chat,
          max_tokens: 1500,
          system: [
            {
              type: "text",
              text:
                `You are a Socratic coach for Stage ${stageNumber} ("${rubric.title}") of a Product/Market Fit journey.\n\n` +
                `Your job is to help the user think more rigorously BEFORE they submit for formal grading. ` +
                `You apply the same rubric the grader uses, but you don't grade — you ask probing questions, ` +
                `point out where reasoning is weak, and suggest reframes. Be direct, brief (2–4 sentences per ` +
                `turn unless asked for depth), and faithful to the PMF principles below.\n\n` +
                `## Rubric for this stage\n${rubric.systemPrompt}\n\n` +
                `## Criteria the grader checks\n` +
                rubric.criteria
                  .map((c, i) => `${i + 1}. ${c.name}: ${c.description}`)
                  .join("\n"),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of apiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            assistantText += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        if (onComplete) await onComplete(assistantText);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
