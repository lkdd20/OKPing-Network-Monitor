import {
  getAuthBackendUrl,
  getForwardedRequestHeaders,
  getWebClientId,
  proxyJson,
} from "@/lib/auth/backend";

export async function POST(request: Request) {
  const response = await fetch(getAuthBackendUrl("/auth/wechat-miniapp/qr/create"), {
    body: JSON.stringify({ clientId: getWebClientId() }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getForwardedRequestHeaders(request),
    },
    method: "POST",
  });

  return proxyJson(response);
}
