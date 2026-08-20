import { apiFetch } from "@/lib/api-client";

export async function getEmails(page = 1, limit = 20) {
  return apiFetch(`/emails?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}

export async function getEmailFiles(emailId) {
  const encodedId = encodeURIComponent(emailId);

  return apiFetch(`/emails/${encodedId}/files`, {
    method: "GET",
  });
}