import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// We'll treat 401 as null user
export function useUser() {
  return useQuery({
    queryKey: [api.auth.status.path],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(api.auth.status.path, {
          headers: token ? { "x-auth-token": token } : {},
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Failed to check status");
        return await res.json();
      } catch (e) {
        return null;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Incorrect password");
        throw new Error("Login failed");
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.status.path] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("auth_token");
      await fetch(api.auth.logout.path, { 
        method: api.auth.logout.method,
        headers: token ? { "x-auth-token": token } : {},
      });
      localStorage.removeItem("auth_token");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.status.path], null);
    },
  });
}
