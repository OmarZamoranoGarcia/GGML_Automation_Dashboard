export async function login(credentials) {
    const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.message || "No se pudo iniciar sesión.");
    }

    return data;
}

export async function apiFetch(url, options = {}) {
    let response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include"
        });

        if (!refreshResponse.ok) {
            return response;
        }

        response = await fetch(url, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });
    }

    return response;
}