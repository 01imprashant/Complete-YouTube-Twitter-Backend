import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
       const conectionInstence=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log("DATABASE CONNECT SUCCESSFULLFY");
       // console.log("connectionInstence",conectionInstence);
    } catch (error) {
        console.log("DATABASE CONECTION ERROR",error);
        process.exit(1);   
    }
}

export default connectDB;
