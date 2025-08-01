import express from 'express'
import { registerUser, getUser } from '../controller/user.controller.js'

const userRoutes = express.Router()

userRoutes.get("/register", registerUser);
userRoutes.get("/:id", getUser);

export default userRoutes