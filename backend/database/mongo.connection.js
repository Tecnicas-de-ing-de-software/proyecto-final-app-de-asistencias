import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv()


let url = process.env.MONGO

const connectionMongodb = async () => {
    
    try {
        
        await mongoose.connect(url)
        console.log("conexion exitosa a la base de datos");
        
    } catch (error) {
        console.error(error);
        
    }

}

export default connectionMongodb