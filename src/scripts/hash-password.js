/**
 * Utilidad de desarrollo para generar el hash bcrypt de una contraseña,
 * útil al crear usuarios manualmente en la base de datos.
 *
 * Uso:
 *   node scripts/hash-password.js "miContraseñaSegura"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
const SALT_ROUNDS = 12;

if (!password) {
    console.error("Uso: node scripts/hash-password.js \"<contraseña>\"");
    process.exit(1);
}

async function generateHash() {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        console.log("\n==============================");
        console.log("Hash generado:");
        console.log(hash);
        await verifyHash(hash);
        console.log("==============================\n");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

async function verifyHash(hash) {
    const isMatch = await bcrypt.compare(password, hash);
    console.log("Verificación (debe ser true):", isMatch);
}

generateHash();
