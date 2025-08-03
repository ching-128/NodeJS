import express from 'express'
import { forgotPassword, getUser, loginUser, logoutUser, registerUser, resetPassword, verifyUser } from '../controller/user.controller.js'
import { isUserVarified } from '../middleware/auth.middleware.js';

const userRoutes = express.Router()

// public routes
userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/verify/:token", verifyUser);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password/:resetToken", resetPassword);

// protected routes
userRoutes.get("/me/", isUserVarified, getUser);
userRoutes.get("/logout", isUserVarified, logoutUser);

export default userRoutes