// Tipo para el usuario cuando lo tratamos en resolvers (por ejemplo en encadenamiento).
// Nota: en Mongo, _id suele ser ObjectId, pero muchas veces lo convertimos a string al devolverlo.

export type ClothingUser = {
    _id: string;
    email: string;
    clothes: string[];  // lista de IDs (string) de ropa comprada
}
