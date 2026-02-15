import { db } from "./db";
import {
  sessions, documents, chats, questions,
  type Document, type Chat, type Question,
  type InsertDocument, type InsertChat, type InsertQuestion
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createSession(token: string): Promise<void>;
  getSession(token: string): Promise<boolean>;
  deleteSession(token: string): Promise<void>;

  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  updateDocumentSummary(id: number, summary: string): Promise<void>;

  getChats(documentId: number): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;

  createQuestions(questionsList: InsertQuestion[]): Promise<void>;
  getQuestions(documentId: number): Promise<Question[]>;
}

export class DatabaseStorage implements IStorage {
  async createSession(token: string): Promise<void> {
    await db.insert(sessions).values({ token });
  }

  async getSession(token: string): Promise<boolean> {
    const result = await db.select().from(sessions).where(eq(sessions.token, token));
    return result.length > 0;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async updateDocumentSummary(id: number, summary: string): Promise<void> {
    await db.update(documents).set({ summary }).where(eq(documents.id, id));
  }

  async getChats(documentId: number): Promise<Chat[]> {
    return await db.select().from(chats)
      .where(eq(chats.documentId, documentId))
      .orderBy(chats.timestamp);
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db.insert(chats).values(chat).returning();
    return newChat;
  }

  async createQuestions(questionsList: InsertQuestion[]): Promise<void> {
    await db.insert(questions).values(questionsList);
  }

  async getQuestions(documentId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.documentId, documentId));
  }
}

export const storage = new DatabaseStorage();
