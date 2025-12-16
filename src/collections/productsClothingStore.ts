import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { COLLECTION_PRODUCTS, COLLECTION_USERS } from "../utils";

/**
 * GET CLOTHES (lista paginada)
 * page: número de página (1,2,3...)
 * size: cuántos elementos por página
 *
 * skip = (page-1)*size
 * limit = size
 */
export const getClothes = async (page?: number, size?: number) => {
    const db = getDB();
    // Página que se quiere mostrar (por defecto la primera)
    page = page || 1;
    // Número de elementos por página (por defecto 10)
    size = size || 10;


    return await db.collection(COLLECTION_PRODUCTS)
    .find() // Se quieren todos los productos
    .skip((page - 1) * size) // Salta los productos de las páginas anteriores
    .limit(size) // Devuelve solo los productos de esta página
    .toArray(); // Convierte el resultado en un array
};

/**
 * GET CLOTHING BY ID
 */
//MongoDB no guarda el _id como string, lo guarda como un ObjectId especial; 
// cuando el id viene de la URL o del frontend llega como string, y si se usa así Mongo no lo reconoce, 
// por eso se convierte con new ObjectId(id) para que el tipo coincida y la búsqueda funcione.
export const getClothingById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_PRODUCTS).findOne({_id: new ObjectId(id)});
};

/**
 * ADD CLOTHING
 * Inserta una prenda y luego la devuelve ya creada.
 */
export const addClothing = async (name: string, size: string, color: string, price: number) => {
    const db = getDB();
    // Inserta el producto
    const result = await db.collection(COLLECTION_PRODUCTS).insertOne({
        name,
        size,
        color,
        price
    });
    // Lo buscamos para devolver el objeto completo con _id
    const newClothing = await getClothingById(result.insertedId.toString());
    return newClothing;
};

/**
 * BUY CLOTHING
 * - Comprueba que la prenda existe
 * - Añade el id de la prenda al array clothes del usuario
 * - Devuelve el usuario actualizado
 */
export const buyClothing = async (clothingId: string, userId: string) => {
    const db = getDB();

    // Convertimos ids a ObjectId para consultas con _id
    const localUserId = new ObjectId(userId);
    const localClothingId = new ObjectId(clothingId);
    
    // Comprobar que la prenda exista
    const clothingToAdd = await db.collection(COLLECTION_PRODUCTS).findOne({_id: localClothingId});
    if(!clothingToAdd) throw new Error("Clothing not found");

    // Actualiza usuario: añade el clothingId a su array "clothes"
    await db.collection(COLLECTION_USERS).updateOne(
        { _id: localUserId }, // usuario a actualizar
        {
            $addToSet: { clothes: clothingId } // $addToSet evita duplicados (si ya estaba, no lo repite)
        }
    );

    // Devuelve el usuario ya actualizado
    const updatedUser = await db.collection(COLLECTION_USERS).findOne({_id: localUserId});
    return updatedUser;
}
