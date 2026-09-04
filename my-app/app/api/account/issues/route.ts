import { fetchAuthenticatedBackend, proxyJson } from "@/lib/auth/backend";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 3;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageNum = Math.max(1, Number(url.searchParams.get("pageNum")) || 1);
  const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get("pageSize")) || 8));
  const category = url.searchParams.get("category") === "cooperation" ? "cooperation" : "feedback";
  try {
    return proxyJson(await fetchAuthenticatedBackend(
      request,
      `/ping/issues/mine?pageNum=${pageNum}&pageSize=${pageSize}&category=${category}`,
    ));
  } catch {
    return Response.json({ code: 502, msg: "问题反馈服务暂时不可用" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_FILES) {
      return Response.json({ code: 400, msg: "最多只能上传3张截图" }, { status: 400 });
    }
    const invalidFile = files.find((file) => file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.has(file.type));
    if (invalidFile) {
      const message = invalidFile.size > MAX_FILE_SIZE
        ? `截图 ${invalidFile.name} 超过5MB`
        : `截图 ${invalidFile.name} 格式不支持`;
      return Response.json({ code: 400, msg: message }, { status: 400 });
    }

    return proxyJson(await fetchAuthenticatedBackend(request, "/ping/issues", {
      body: formData,
      method: "POST",
    }));
  } catch {
    return Response.json({ code: 502, msg: "问题反馈提交失败，请稍后重试" }, { status: 502 });
  }
}
