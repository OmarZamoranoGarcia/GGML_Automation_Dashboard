// lib/rate-limit.js
//
// Rate limiter simple basado en memoria (sliding window).
// Sirve para proyectos con UNA sola instancia/servidor (por ejemplo,
// un VPS o un contenedor). Si tu app corre en serverless con múltiples
// instancias (Vercel con varias funciones, edge, etc.) esto NO comparte
// estado entre instancias -- en ese caso usa Upstash Redis (ver nota al final).

// Almacén en memoria. Se limpia solo con el paso del tiempo (lazy).
const buckets = new Map();

/**
 * Limita solicitudes por "identifier" (normalmente la IP o un userId).
 *
 * @param {string} identifier - único por cliente (ip, userId, apiKey, etc.)
 * @param {number} limit - cantidad máxima de requests permitidos
 * @param {number} windowMs - duración de la ventana en milisegundos
 * @returns {{ success: boolean, limit: number, remaining: number, reset: number }}
 */
function rateLimit(identifier, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(identifier);

  if (!bucket || now > bucket.resetAt) {
    // No existe bucket o ya expiró la ventana -> se crea uno nuevo
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - bucket.count,
    reset: bucket.resetAt,
  };
}

/**
 * Limpia el contador de un identifier. Útil para resetear el límite
 * después de una acción exitosa (ej: login correcto).
 * @param {string} identifier
 */
function resetLimit(identifier) {
  buckets.delete(identifier);
}

/**
 * Helper para obtener un identificador (IP) desde un Request estándar
 * (funciona tanto en App Router route handlers como en middleware).
 * @param {Request} req
 * @returns {string}
 */
function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

module.exports = { rateLimit, resetLimit, getClientIp };