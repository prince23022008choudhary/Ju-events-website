import { getUser, verifyRequestOrigin } from "@netlify/identity";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  return json({ error: "The service is temporarily unavailable. Please try again shortly." }, 503);
}

export async function requireUser(request: Request) {
  if (request.method !== "GET") {
    try { verifyRequestOrigin(request); }
    catch { throw new HttpError(403, "This request could not be verified. Refresh the page and try again."); }
  }
  const user = await getUser();
  if (!user?.confirmedAt) throw new HttpError(401, "Please sign in with a verified account to continue.");
  return user;
}

export async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "A JSON request is required.");
  const content = await request.text();
  if (new TextEncoder().encode(content).length > 4096) throw new HttpError(413, "Request is too large.");
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch { throw new HttpError(400, "Please provide valid registration information."); }
}

export function field(value: unknown, label: string, maximum = 100) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maximum) throw new HttpError(400, `Please enter a valid ${label}.`);
  return value.trim();
}
