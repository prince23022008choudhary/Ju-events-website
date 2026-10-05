import { and, eq } from "drizzle-orm";
import { database } from "../../db/index.js";
import { bookmarks, events } from "../../db/schema.js";
import { requireUser, json, body, field, failure, HttpError } from "../lib/http.js";

export default async (request: Request) => {
  if (!["POST", "DELETE"].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  try {
    const user = await requireUser(request);
    const eventId = field((await body(request)).eventId, "event", 80);
    const db = database();
    const [event] = await db.select({ id: events.id }).from(events).where(eq(events.id, eventId));
    if (!event) throw new HttpError(404, "This event could not be found.");
    if (request.method === "POST") await db.insert(bookmarks).values({ eventId, userId: user.id }).onConflictDoNothing();
    else await db.delete(bookmarks).where(and(eq(bookmarks.eventId, eventId), eq(bookmarks.userId, user.id)));
    return json({ saved: request.method === "POST" });
  } catch (error) { return failure(error); }
};
