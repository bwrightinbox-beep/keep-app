import { pgTable, serial, text, timestamp, varchar, integer, boolean, json, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Partner profiles - each user has one partner profile
export const partnerProfiles = pgTable('partner_profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  birthday: text('birthday'), // Store as ISO date string
  anniversary: text('anniversary'), // Store as ISO date string
  loveLanguages: json('love_languages').$type<string[]>().default([]),
  favoriteThings: text('favorite_things'),
  dislikes: text('dislikes'),
  sizes: json('sizes').$type<{
    shirt?: string
    pants?: string
    shoe?: string
    ring?: string
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Memories - the core feature of the app
export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').default(''),
  body: text('body').default(''),
  category: varchar('category', { length: 100 }).default('general'),
  tags: json('tags').$type<string[]>().default([]),
  rating: integer('rating').default(3),
  date: text('date'), // Store as ISO date string - when the memory happened
  importance: varchar('importance', { length: 10 }).default('low').notNull(), // 'low' | 'medium' | 'high'
  sensitivity: varchar('sensitivity', { length: 10 }).default('normal').notNull(), // 'normal' | 'private'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Plans - both custom and AI-generated plans
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').default(''),
  budgetMin: integer('budget_min').default(0),
  budgetMax: integer('budget_max').default(0),
  durationMinutes: integer('duration_minutes').default(0),
  difficulty: varchar('difficulty', { length: 10 }).default('Easy'), // 'Easy' | 'Medium' | 'Hard'
  steps: json('steps').$type<string[]>().default([]),
  tags: json('tags').$type<string[]>().default([]),
  isCustom: boolean('is_custom').default(true),
  reasoning: text('reasoning'), // For AI-generated plans
  confidence: integer('confidence'), // For AI-generated plans (1-100)
  scheduledFor: timestamp('scheduled_for'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// App settings for each user
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  // Notification settings
  dailyPrompts: boolean('daily_prompts').default(true),
  weeklyCheckins: boolean('weekly_checkins').default(false),
  dateReminders: boolean('date_reminders').default(true),
  emailNotifications: boolean('email_notifications').default(true),
  // Preference settings
  timezone: varchar('timezone', { length: 50 }).default('America/New_York'),
  quietHoursStart: varchar('quiet_hours_start', { length: 10 }).default('22:00'),
  quietHoursEnd: varchar('quiet_hours_end', { length: 10 }).default('08:00'),
  // Localization settings
  locale: varchar('locale', { length: 10 }).default('auto'), // 'auto' or specific locale like 'en-GB'
  currency: varchar('currency', { length: 5 }).default('auto'), // 'auto' or specific currency like 'GBP'
  // Privacy settings
  showPrivateMemories: boolean('show_private_memories').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertPartnerProfileSchema = createInsertSchema(partnerProfiles)
export const selectPartnerProfileSchema = createSelectSchema(partnerProfiles)

export const insertMemorySchema = createInsertSchema(memories)
export const selectMemorySchema = createSelectSchema(memories)

export const insertPlanSchema = createInsertSchema(plans)
export const selectPlanSchema = createSelectSchema(plans)

export const insertAppSettingsSchema = createInsertSchema(appSettings)
export const selectAppSettingsSchema = createSelectSchema(appSettings)

// Types for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type PartnerProfile = typeof partnerProfiles.$inferSelect
export type NewPartnerProfile = typeof partnerProfiles.$inferInsert

export type Memory = typeof memories.$inferSelect
export type NewMemory = typeof memories.$inferInsert

export type Plan = typeof plans.$inferSelect
export type NewPlan = typeof plans.$inferInsert

export type AppSettings = typeof appSettings.$inferSelect
export type NewAppSettings = typeof appSettings.$inferInsert