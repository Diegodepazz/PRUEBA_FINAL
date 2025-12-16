import { getDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import { COLLECTION_USERS } from "../utils";
import { ObjectId } from "mongodb";


/**
 * CREA USUARIO (REGISTER)
 * - Guarda email
 * - Encripta password con bcrypt
 * - Inicializa clothes como [] (muy importante para GraphQL)
 */
export const createUser = async (email: string, password: string) => {
    const db = getDB(); // Obtiene la BD
    const toEncriptao = await bcrypt.hash(password, 10); // Encripta password (hash) con 10 salt rounds

    // Inserta el usuario en la colección de usuarios
    const result = await db.collection(COLLECTION_USERS).insertOne({
        email,
        password: toEncriptao,
        clothes: [] //IMPORTANTE: array vacío desde el inicio
    });

    // Devuelve el id insertado como string
    return result.insertedId.toString();
};


/**
 * VALIDA USUARIO (LOGIN)
 * - Busca el usuario por email
 * - Compara password con bcrypt.compare
 * - Si coincide, devuelve el usuario
 * - Si no, devuelve null
 */
export const validateUser = async (email: string, password: string) => {
    const db = getDB();

    // Busca usuario por email
    const user = await db.collection(COLLECTION_USERS).findOne({email});
    if( !user ) return null; // Si no existe usuario -> credenciales inválidas

    // Compara password en texto con la hash guardada
    const laPassEsLaMismaMismita = await bcrypt.compare(password, user.password);
    if(!laPassEsLaMismaMismita) return null; // Si no coincide -> inválido

    // Si coincide -> devuelve usuario completo
    return user;
};

/**
 * BUSCA USUARIO POR ID
 * - Convierte string a ObjectId
 */

//MongoDB no guarda el _id como string, lo guarda como un ObjectId especial; 
// cuando el id viene de la URL o del frontend llega como string, y si se usa así Mongo no lo reconoce, 
// por eso se convierte con new ObjectId(id) para que el tipo coincida y la búsqueda funcione.
export const findUserById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_USERS).findOne({_id: new ObjectId(id)})
}