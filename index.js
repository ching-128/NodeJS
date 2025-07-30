import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import db from "./utils/db.js";

// configure envoirment variable
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("app is running succusfully!");
})

app.get("/myRoute", (req, res) => {
    res.send({
        succes: true,
        code: 200,
        body: "You have entered my route"
    })
})

// connect db
db();

app.listen(port, () => {
    console.log(`server is running at port ${port}`);
})