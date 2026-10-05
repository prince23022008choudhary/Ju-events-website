import { eq, desc } from "drizzle-orm";
import { database } from "../../db/index.js";
import { registrations, bookmarks, events } from "../../db/schema.js";
import { requireUser, json, failure } from "../lib/http.js";

export default async (request: Request) => {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  try {
    const user = await requireUser(request);
    const db = database();
    const [tickets, saved] = await Promise.all([
      db.select({ id: registrations.id, eventId: registrations.eventId, studentName: registrations.studentName, studentId: registrations.studentId, createdAt: registrations.createdAt, event: events }).from(registrations).innerJoin(events, eq(registrations.eventId, events.id)).where(eq(registrations.userId, user.id)).orderBy(desc(registrations.createdAt)),
      db.select({ eventId: bookmarks.eventId }).from(bookmarks).where(eq(bookmarks.userId, user.id)),
    ]);
    return json({ tickets, saved: saved.map((item) => item.eventId) });
  } catch (error) { return failure(error); }
};
