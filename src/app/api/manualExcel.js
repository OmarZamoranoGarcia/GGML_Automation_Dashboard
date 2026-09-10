import { apiFetch } from "@/lib/api-client";

export async function uploadManualExcel(client, file) {
  const formData = new FormData();
  formData.append("Client", client);
  formData.append("File", file);

  return apiFetch("/ggml-automation/excel/process", {
    method: "POST",
    body: formData,
  });
}