import express from 'express'
import { registerUser } from '../controller/user.controller.js'

const userRoutes = express.Router()

userRoutes.get("/register", registerUser);

export default userRoutes