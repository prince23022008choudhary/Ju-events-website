import { and, eq, sql } from "drizzle-orm";
import { database } from "../../db/index.js";
import { registrations, events } from "../../db/schema.js";
import { requireUser, json, body, field, failure, HttpError } from "../lib/http.js";

export default async (request: Request) => {
  if (!["POST", "DELETE"].includes(request.method)) return json({ error: "Method not allowed." }, 405);
  try {
    const user = await requireUser(request);
    const input = await body(request);
    const eventId = field(input.eventId, "event", 80);
    const studentName = request.method === "POST" ? field(input.studentName, "full name") : "";
    const studentId = request.method === "POST" ? field(input.studentId, "student ID", 40) : "";
    const db = database();
    const result = await db.transaction(async (transaction) => {
      const [event] = await transaction.select().from(events).where(eq(events.id, eventId)).for("update");
      if (!event) throw new HttpError(404, "This event could not be found.");
      const filter = and(eq(registrations.eventId, eventId), eq(registrations.userId, user.id));
      if (request.method === "DELETE") {
        if (event.startsAt <= new Date()) throw new HttpError(409, "Registration changes close when an event starts.");
        const cancelled = await transaction.delete(registrations).where(filter).returning({ id: registrations.id });
        if (cancelled.length) await transaction.update(events).set({ registered: sql`${events.registered} - 1` }).where(eq(events.id, eventId));
        return { cancelled: true };
      }
      const [existing] = await transaction.select().from(registrations).where(filter);
      if (existing) throw new HttpError(409, "You're already registered. Your ticket is in My registrations.");
      if (event.startsAt <= new Date()) throw new HttpError(409, "Registration for this event has closed.");
      if (event.registered >= event.capacity) throw new HttpError(409, "This event is full. Explore another campus experience.");
      const [registration] = await transaction.insert(registrations).values({ eventId, userId: user.id, studentName, studentId }).returning();
      await transaction.update(events).set({ registered: sql`${events.registered} + 1` }).where(eq(events.id, eventId));
      return { registration };
    });
    return json(result, request.method === "POST" ? 201 : 200);
  } catch (error) { return failure(error); }
};
