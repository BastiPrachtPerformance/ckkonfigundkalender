import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const bookingDates = sqliteTable("booking_dates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hall: text("hall").notNull(),
  eventDate: text("event_date").notNull(),
  status: text("status").notNull().default("reserved"),
  requestId: text("request_id").notNull(),
  source: text("source").notNull().default("customer"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_booking_dates_hall_event_date").on(table.hall, table.eventDate),
]);

export const bookingRequests = sqliteTable("booking_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  eventDate: text("event_date").notNull(),
  hall: text("hall").notNull(),
  guestCount: integer("guest_count").notNull(),
  configuration: text("configuration", { mode: "json" }).notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("neu"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bookingSettings = sqliteTable("booking_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bookingDateNotes = sqliteTable("booking_date_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hall: text("hall").notNull(),
  eventDate: text("event_date").notNull(),
  note: text("note").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_booking_date_notes_hall_event_date").on(table.hall, table.eventDate),
]);
