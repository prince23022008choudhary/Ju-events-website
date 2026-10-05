CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"venue" text NOT NULL,
	"organizer" text NOT NULL,
	"image" text NOT NULL,
	"capacity" integer NOT NULL,
	"registered" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sample" boolean DEFAULT true NOT NULL,
	CONSTRAINT "events_capacity_positive" CHECK ("capacity" > 0),
	CONSTRAINT "events_registration_bounds" CHECK ("registered" >= 0 AND "registered" <= "capacity"),
	CONSTRAINT "events_time_order" CHECK ("ends_at" > "starts_at")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"student_name" text NOT NULL,
	"student_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_event_user_unique" ON "bookmarks" ("event_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_event_user_unique" ON "registrations" ("event_id","user_id");--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id");