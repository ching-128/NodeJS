import express from 'express'
import { loginUser, registerUser, verifyUser } from '../controller/user.controller.js'

const userRoutes = express.Router()

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/verify/:token", verifyUser);

export default userRoutes