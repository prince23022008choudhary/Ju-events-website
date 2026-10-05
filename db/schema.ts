import { pgTable, text, timestamp, integer, boolean, uuid, uniqueIndex, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const events = pgTable("events", {
  id: text().primaryKey(),
  title: text().notNull(),
  category: text().notNull(),
  description: text().notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  venue: text().notNull(),
  organizer: text().notNull(),
  image: text().notNull(),
  capacity: integer().notNull(),
  registered: integer().notNull().default(0),
  featured: boolean().notNull().default(false),
  sample: boolean().notNull().default(true),
}, (table) => [
  check("events_capacity_positive", sql`${table.capacity} > 0`),
  check("events_registration_bounds", sql`${table.registered} >= 0 AND ${table.registered} <= ${table.capacity}`),
  check("events_time_order", sql`${table.endsAt} > ${table.startsAt}`),
]);

export const registrations = pgTable("registrations", {
  id: uuid().primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().references(() => events.id),
  userId: text("user_id").notNull(),
  studentName: text("student_name").notNull(),
  studentId: text("student_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("registrations_event_user_unique").on(table.eventId, table.userId)]);

export const bookmarks = pgTable("bookmarks", {
  id: uuid().primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().references(() => events.id),
  userId: text("user_id").notNull(),
}, (table) => [uniqueIndex("bookmarks_event_user_unique").on(table.eventId, table.userId)]);
