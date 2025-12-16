import { IResolvers } from "@graphql-tools/utils";
import { addClothing, buyClothing, getClothes, getClothingById } from "../collections/productsClothingStore";
import { createUser, validateUser } from "../collections/usersClothingStore";
import { signToken } from "../auth";
import { ClothingUser } from "../types";
import { getDB } from "../db/mongo";
import { ObjectId } from "mongodb";

// Los resolvers implementan EXACTAMENTE lo que define schema.ts
export const resolvers: IResolvers = {
    // ---------- CONSULTAS (LECTURA) ----------
    Query: {
        // Devuelve la lista de ropa con paginación
        clothes: async (_, { page, size }) => {
            return await getClothes(page, size);
        },

        // Devuelve una prenda concreta por su id
        clothing: async (_, { id }) => {
            return await getClothingById(id);
        },

        // Devuelve el usuario logeado (si hay token válido)
        me: async (_, __, { user }) => {
            // Si no hay usuario en el contexto, no estás logeado
            if(!user) return null;
            // Devuelve los datos del usuario
            // Se convierte el _id a string porque GraphQL trabaja con JSON
            return {
                _id: user._id.toString(),
                ...user
            }
        }
    },
    
    // ---------- MUTACIONES (ESCRITURA) ----------
    Mutation: {
        // Crea una prenda nueva (solo si estás logeado)
        addClothing: async (_, { name, size, color, price }, { user }) => {
            // Si no hay usuario, no se permite crear ropa
            if(!user) throw new Error("Tienes que estar logeado para crear ropa");
            return await addClothing(name, size, color, price);
        },

        // Compra una prenda (solo si estás logeado)
        buyClothing: async (_, { clothingId }, { user }) => {
            // Sin usuario no se puede comprar
            if(!user) throw new Error("You must be logged in to buy clothes");
            // Se pasa el id del usuario como string
            return await buyClothing(clothingId, user._id.toString());
        },

        // Registro de usuario: crea usuario y devuelve un token
        register: async (_, { email, password }) => {
            const userId = await createUser(email, password);
            // Se genera un JWT con el id del usuario
            return signToken(userId);
        },

        // Login: valida usuario y devuelve un token
        login: async (_, { email, password }) => {
            const user = await validateUser(email, password);
            // Si las credenciales son incorrectas, error
            if(!user) throw new Error("Invalid credentials");
            // Se genera un JWT con el id del usuario
            return signToken(user._id.toString());
        }
    },

    // ---------- RESOLVER DE CAMPO (ENCADENAMIENTO) ----------
    // Esto se ejecuta cuando se pide User { clothes }
    // Esto es encadenamiento, porque tienes usuario y te muestra su ropa
    User: {
        clothes: async (parent: ClothingUser) => {
            // parent ES el usuario que GraphQL ya ha obtenido antes

            // Ejemplo de parent:
            // {
            //   _id: "abc123",
            //   email: "juan@email.com",
            //   clothes: ["id1", "id2"]
            // }

            // Conectamos a la base de datos
            const db = getDB();

            // parent.clothes NO es la ropa completa
            // Es SOLO una lista de ids de ropa guardados en el usuario
            const listaDeIdsDeRopa = parent.clothes;

            // Si el usuario no tiene ropa asociada, devolvemos un array vacío
            if(!listaDeIdsDeRopa) return [];

            // Los ids vienen como string, pero Mongo necesita ObjectId para buscar por _id
            const objectIds = listaDeIdsDeRopa.map((id) => new ObjectId(id));

            // Buscamos en la colección de productos TODAS las prendas cuyo _id esté dentro de la lista de ids del usuario
            return db.collection("productsClothingStore").find({ 
                _id: { $in: objectIds }  // $in significa: "este _id está dentro de esta lista"
            }).toArray(); // Devuelve las prendas completas como array
        }
    }
}
