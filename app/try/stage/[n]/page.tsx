import { notFound } from "next/navigation";
import { GuestStagePage } from "@/components/GuestStagePage";

export default async function Page({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const stageNumber = Number(n);
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 7) {
    notFound();
  }
  return <GuestStagePage stageNumber={stageNumber} />;
}
