"use client";

import { useState, useRef } from "react";
import { uploadManualExcel } from "@/app/api/manualExcel";

const CLIENTS = [
  { value: "Cliente3", label: "Jimsa" },
  { value: "Cliente4", label: "Diproquim" },
];

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

function getExtension(fileName) {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

export default function ManualExcelUpload() {
  const [client, setClient] = useState(CLIENTS[0].value);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  function applyFile(selected) {
    if (!selected) return;

    if (!ALLOWED_EXTENSIONS.includes(getExtension(selected.name))) {
      setFile(null);
      setStatus("error");
      setErrorMessage("Formato no soportado.");
      return;
    }

    setFile(selected);
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      setStatus("error");
      setErrorMessage("Elige un archivo.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const response = await uploadManualExcel(client, file);

      if (response?.success === false) {
        setStatus("error");
        setErrorMessage(response.errorMessage || "Terminó con errores.");
        setResult(response);
        return;
      }

      setStatus("success");
      setResult(response);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setErrorMessage(err?.message || "No se pudo procesar.");
    }
  }

  return (
    <div className="border-t border-[var(--border-subtle)] pt-4">
      <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
        Carga manual
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          disabled={status === "loading"}
          className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] disabled:text-[var(--text-muted)]"
        >
          {CLIENTS.map((c) => (
            <option key={c.value} value={c.value} className="bg-[var(--bg-input)]">
              {c.label}
            </option>
          ))}
        </select>

        <label
          htmlFor="manual-file"
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
        >
          <span className="truncate">
            {file ? file.name : "Elegir archivo"}
          </span>
          <span className="shrink-0 text-[var(--text-muted)]">.xlsx</span>
          <input
            ref={inputRef}
            id="manual-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
            disabled={status === "loading"}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading" || !file}
          className="w-full rounded-lg bg-[var(--accent)] px-2 py-1.5 text-xs font-medium text-[var(--bg-primary)] shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--border-subtle)] disabled:text-[var(--text-muted)] disabled:shadow-none"
        >
          {status === "loading" ? "Procesando..." : "Procesar"}
        </button>

        {status === "success" && result && (
          <p className="text-xs leading-snug text-emerald-400">
            Listo para {result.client}.
          </p>
        )}

        {status === "error" && (
          <p className="text-xs leading-snug text-red-400">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}