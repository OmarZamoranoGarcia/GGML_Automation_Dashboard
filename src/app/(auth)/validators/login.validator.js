export function validateLogin(data) {
    const { email, password } = data;

    if (!email || !password) {
        return {
            success: false,
            message: "Email y contraseña son obligatorios."
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: "Email inválido."
        };
    }

    if (password.length < 8) {
        return {
            success: false,
            message: "La contraseña debe tener al menos 8 caracteres."
        };
    }

    return {
        success: true
    };
}