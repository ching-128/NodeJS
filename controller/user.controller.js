import User from "../model/User.model.js";
import crypto from "crypto";

const registerUser = async (req, res) => {
    try {
        // Check if req.body exists
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { name, email, password } = req.body;

        // Check if any required field is missing
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "The user already existed"
            });
        }

        const user = await User.create({
            name,
            email,
            password
        })

        if (!user) {
            return res.status(400).json({
                messege: "user not registered"
            })
        }

        const token = crypto.randomBytes(32).toString("hex")
        user.verificationToken = token
        const savedUser = await user.save()
        console.log("User registered successfully:", savedUser);
        
        if (!savedUser) {
            return res.status(500).json({
                message: "Failed to save user"
            });
        }

        // send email


        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getUser = async (req, res) => {
    res.send(`User ID: ${req.params.id}`);
}


export {
    registerUser,
    getUser
}