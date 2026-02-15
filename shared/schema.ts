import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Extracted text
  summary: text("summary"), // AI generated summary
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>(), // For MCQs
  correctAnswer: text("correct_answer").notNull(),
  type: text("type").notNull(), // 'mcq', 'true_false', 'yes_no'
  explanation: text("explanation"),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id),
  role: text("role").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true, timestamp: true });

export type Document = typeof documents.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Chat = typeof chats.$inferSelect;
