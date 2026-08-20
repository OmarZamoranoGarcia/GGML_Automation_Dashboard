import { apiFetch } from "@/lib/api-client";

export async function checkEmails() {
  return apiFetch('/ggml-automation/email/check', {
    method: 'GET',
  });
}