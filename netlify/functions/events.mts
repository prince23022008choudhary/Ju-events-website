import { asc } from "drizzle-orm";
import { database } from "../../db/index.js";
import { events } from "../../db/schema.js";
import { sampleCatalog } from "../../db/catalog.js";
import { json, failure } from "../lib/http.js";

export default async (request: Request) => {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  try {
    const db = database();
    let catalog = await db.select().from(events).orderBy(asc(events.startsAt));
    if (!catalog.length) {
      await db.insert(events).values(sampleCatalog()).onConflictDoNothing();
      catalog = await db.select().from(events).orderBy(asc(events.startsAt));
    }
    return json({ events: catalog });
  } catch (error) { return failure(error); }
};
