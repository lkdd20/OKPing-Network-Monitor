import { handleBatchProbeRequest } from "@/lib/ping/batchServer";

export function POST(request: Request) {
  return handleBatchProbeRequest(request, "batch_ping");
}
