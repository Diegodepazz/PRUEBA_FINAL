import { ApolloServer } from "apollo-server";
import { connectToMongoDB } from "./db/mongo"
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./auth";

const start = async () => {
  // Primero conectar a Mongo
  await connectToMongoDB();

  // Crear servidor Apollo
  const server = new ApolloServer({
    typeDefs, // Define QUÉ se puede pedir en GraphQL
    resolvers, // Define CÓMO se obtiene cada dato
    
    // CONTEXT:
    // Esta función se ejecuta EN CADA PETICIÓN
    // Sirve para pasar información común a todos los resolvers
    context: async ({ req }) => {
      // Lee token de la cabecera Authorization
      const token = req.headers.authorization || "";
      
      // Si hay token, intentamos obtener el usuario real desde la BD
      // Si el token es inválido, getUserFromToken devuelve null
      const user = token ? await getUserFromToken(token as string) : null;
      
      // Devolvemos el usuario para que los resolvers lo puedan usar
      // Luego en resolvers aparece como tercer parámetro: { user }
      return { user };
    },
  });

  // Escuchar puerto
  await server.listen({ port: 4003 });
  console.log("GQL sirviendo y de to");
};


// Arranca y captura errores
start().catch(err=>console.log("Error of top run: ", err));
