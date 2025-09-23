CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_prompts" boolean DEFAULT true,
	"weekly_checkins" boolean DEFAULT false,
	"date_reminders" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT true,
	"timezone" varchar(50) DEFAULT 'America/New_York',
	"quiet_hours_start" varchar(10) DEFAULT '22:00',
	"quiet_hours_end" varchar(10) DEFAULT '08:00',
	"theme" varchar(10) DEFAULT 'light',
	"show_private_memories" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '',
	"body" text DEFAULT '',
	"category" varchar(100) DEFAULT 'general',
	"tags" json DEFAULT '[]'::json,
	"rating" integer DEFAULT 3,
	"date" text,
	"importance" varchar(10) DEFAULT 'low' NOT NULL,
	"sensitivity" varchar(10) DEFAULT 'normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"birthday" text,
	"anniversary" text,
	"love_languages" json DEFAULT '[]'::json,
	"favorite_things" text,
	"dislikes" text,
	"sizes" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text DEFAULT '',
	"budget_min" integer DEFAULT 0,
	"budget_max" integer DEFAULT 0,
	"duration_minutes" integer DEFAULT 0,
	"difficulty" varchar(10) DEFAULT 'Easy',
	"steps" json DEFAULT '[]'::json,
	"tags" json DEFAULT '[]'::json,
	"is_custom" boolean DEFAULT true,
	"reasoning" text,
	"confidence" integer,
	"scheduled_for" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_profiles" ADD CONSTRAINT "partner_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;