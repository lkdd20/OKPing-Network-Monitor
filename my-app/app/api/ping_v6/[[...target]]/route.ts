import { handleIPv6ProbeRequest } from "@/lib/ping/ipv6ProbeRoute";

export async function POST(request: Request) {
  return handleIPv6ProbeRequest(request, "ping_v6");
}
