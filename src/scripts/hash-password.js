import bcrypt from "bcryptjs";

const password = ""; //Ingresar contraseña a hashear

const SALT_ROUNDS = 12;

async function generateHash() {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        console.log("\n==============================");
        console.log("Contraseña:");
        console.log(password);
        console.log("\nHash:");
        console.log(hash);
        verifyHash(hash);
        console.log("==============================\n");
    } catch (error) {
        console.error(error);
    }
}

async function verifyHash(hash) {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        console.log("La contraseña es válida:", isMatch);
    }catch (error) {
        console.error(error);
    }
}

generateHash();