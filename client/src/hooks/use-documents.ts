import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// --- Document Operations ---

export function useDocument(id: number | null) {
  return useQuery({
    queryKey: [api.documents.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.documents.get.path, { id });
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await apiRequest(api.documents.upload.method, api.documents.upload.path, formData);
      return await res.json();
    },
  });
}

export function useSummarizeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.documents.summarize.path, { id });
      const res = await apiRequest(api.documents.summarize.method, url);
      return await res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.documents.get.path, id] });
    },
  });
}

// --- Chat Operations ---

export function useChatHistory(docId: number | null) {
  return useQuery({
    queryKey: [api.chat.list.path, docId],
    queryFn: async () => {
      if (!docId) return [];
      const url = buildUrl(api.chat.list.path, { id: docId });
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!docId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ docId, message }: { docId: number; message: string }) => {
      const url = buildUrl(api.chat.message.path, { id: docId });
      const res = await apiRequest(api.chat.message.method, url, { message });
      return await res.json();
    },
    onSuccess: (_, { docId }) => {
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path, docId] });
    },
  });
}

// --- Quiz Operations ---

export function useGenerateQuiz() {
  return useMutation({
    mutationFn: async (docId: number) => {
      const url = buildUrl(api.quiz.generate.path, { id: docId });
      const res = await apiRequest(api.quiz.generate.method, url);
      return await res.json();
    },
  });
}
