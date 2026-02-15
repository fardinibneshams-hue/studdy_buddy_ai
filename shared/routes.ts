import { z } from 'zod';
import { insertDocumentSchema, insertChatSchema } from './schema';

export const errorSchemas = {
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  serverError: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ password: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/auth/status' as const,
      responses: {
        200: z.object({ authenticated: z.boolean() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  documents: {
    upload: {
      method: 'POST' as const,
      path: '/api/documents' as const,
      // Input is FormData (multipart), so body schema is not strictly validated by JSON parser middleware
      // But we define response here
      responses: {
        200: insertDocumentSchema.extend({ id: z.number() }),
        500: errorSchemas.serverError,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/documents/:id' as const,
      responses: {
        200: insertDocumentSchema.extend({ id: z.number() }),
        404: errorSchemas.notFound,
      },
    },
    summarize: {
      method: 'POST' as const,
      path: '/api/documents/:id/summarize' as const,
      responses: {
        200: z.object({ summary: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  chat: {
    list: {
      method: 'GET' as const,
      path: '/api/documents/:id/chat' as const,
      responses: {
        200: z.array(insertChatSchema.extend({ id: z.number() })),
      },
    },
    message: {
      method: 'POST' as const,
      path: '/api/documents/:id/chat' as const,
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({ response: z.string() }),
      },
    },
  },
  quiz: {
    generate: {
      method: 'POST' as const,
      path: '/api/documents/:id/quiz' as const,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          question: z.string(),
          options: z.array(z.string()).nullable(),
          correctAnswer: z.string(),
          type: z.string(),
          explanation: z.string().nullable(),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
