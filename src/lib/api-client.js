const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL;

export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

let onUnauthorized = null;

export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

let refreshPromise = null;

async function performTokenRefresh() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Platform": "web",
      },
      credentials: "include", // manda la cookie httpOnly del refresh token
    });

    return res.ok;
  } catch {
    return false;
  }
}

function getOrCreateRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doFetch(path, options) {
  const { headers, skipAuthRetry, ...rest } = options;
  
  return fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include", // manda cookies (access_token y refresh_token) en cada request
    headers: {
      "Content-Type": "application/json",
      "X-Client-Platform": "web",
      ...headers,
    },
  });
}

export async function apiFetch(path, options = {}) {
  let res = await doFetch(path, options);

  if (res.status === 401 && !options.skipAuthRetry) {
    const refreshed = await getOrCreateRefreshPromise();

    if (refreshed) {
      res = await doFetch(path, options); // reintenta, la cookie ya se renovó
    } else {
      onUnauthorized?.();
      const data = await res.json().catch(() => null);
      throw new ApiError(data?.message || "Sesión expirada", 401);
    }
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorized?.();
    }
    throw new ApiError(data?.message || "Error en la petición", res.status);
  }

  return data;
}