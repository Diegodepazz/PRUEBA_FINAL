import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { getDB } from "./db/mongo";
import { ObjectId } from 'mongodb';
import { COLLECTION_USERS } from './utils';

dotenv.config()

// Secreto de .env (obligatorio)
const SUPER_SECRETO = process.env.SUPER_SECRET;

// El payload es la información que va dentro del token. Contenido que guardamos dentro del token
type TokenPayload = {
    userId: string;
}

// Firma un token con el userId y caduca en 1 hora
export const signToken = (userId: string) => jwt.sign({ userId }, SUPER_SECRETO!, { expiresIn: "1h" });

// Verifica token y devuelve payload o null si inválido
export const verifyToken = (token: string): TokenPayload | null => {
    try{
        if(!SUPER_SECRETO) throw new Error("SECRET is not defined in environment variables");
        return jwt.verify(token, SUPER_SECRETO) as TokenPayload;
    }catch (err){
        return null;
    }
};

// Con el token, obtiene el usuario real de Mongo
export const getUserFromToken = async (token: string) => {
    // Verifica el token y obtiene el payload (datos guardados en el token)
    const payload = verifyToken(token);
    // Si el token no es válido, no hay usuario
    if(!payload) return null;
    // Obtiene la conexión a la base de datos
    const db = getDB();

    // Busca en la base de datos al usuario cuyo _id coincide
    // El userId viene en el token como string, por eso se convierte a ObjectId
    return await db.collection(COLLECTION_USERS).findOne({
        _id: new ObjectId(payload.userId)
    })
}