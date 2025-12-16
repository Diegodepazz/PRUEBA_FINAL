import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();  //lee el archivo .env y carga sus variables en process.env para poder usarlas en el programa.

let client: MongoClient; // Guarda el cliente conectado
let dB: Db; // Guarda la base de datos ya seleccionada
const dbName = "dbEjemploFinal"; // Nombre de la base de datos que vas a usar dentro del servidor Mongo

// Función para conectar con MongoDB (se llama una vez al arrancar el servidor)
export const connectToMongoDB = async () => {
    try{
        // Lee la URL de Mongo desde el .env
        const mongoUrl = process.env.MONGO_URL;

        // Si existe la variable, conectamos
        if(mongoUrl){
            // Crea el cliente con la URL
            client = new MongoClient(mongoUrl);
            // Conecta de verdad (await porque tarda)
            await client.connect();
            // Selecciona la base de datos (dbName)
            dB = client.db(dbName);
            console.log("Estás conectado al mondongo cosa guapa!");
        } else {
            // Si no existe MONGO_URL, lanzamos error
            throw new Error("MONGO_URL is not defined in environment variables");
        }
    }
    catch(err){
        // Si algo falla (URL mal, Mongo caído, etc.)
        console.log("Error del mondongo baby: ", err)
    }
};

// Getter para usar la BD en cualquier archivo (después de conectar)
export const getDB = ():Db => dB;
