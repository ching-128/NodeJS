import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const db = () => {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Mongo DB connected");

        })
        .catch((error) => {
            console.log("Error connecting to Mongo DB", error);
        })
}

export default db