import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";

dotenv.config();

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
        await user.save()

        // send email
        const tranporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        const mailOptions = {
            from: '"Testing Team" <noreply@creativedesk.org.in>',
            to: user.email,
            subject: 'Varification Mail',
            text: `Please click the following like below to varify your email :
            ${process.env.BASE_URL}/api/v1/user/varifyUser?token=${user.verificationToken}`,
            html: `<h2>Varification Email</h2><p>Please click the link below to varify your email:</p><a href="${process.env.BASE_URL}/api/v1/users/verify/${user.verificationToken}">Varify Email</a>`,
        }

        tranporter.sendMail(mailOptions)


        res.status(201).json({
            message: "User registered successfully",
            success: true
        });

    } catch (error) {
        res.status(400).json({
            message: "User not registered",
            success: false
        });
    }
}

const loginUser = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid Password",
                success: true
            })
        }

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPRAIR_IN
        })

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 1 * 24 * 60 * 60 * 1000
        }
        res.cookie("token", token, cookieOptions)
        res.status(200).json({
            message: "User logged in succesfully",
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error.message);
        
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

const verifyUser = async (req, res) => {
    const token = req.params.token

    if (!token) {
        return res.status(400).json({
            message: "Invalid Token"
        })
    }

    const user = await User.findOne({
        verificationToken: token
    })

    if (!user) {
        return res.status(400).json({
            message: "Invalid Token"
        })
    }

    user.isVarified = true
    user.verificationToken = undefined
    await user.save()

    res.status(201).json({
        message: "Your email varified",
        success: true
    })
}


export {
    registerUser,
    loginUser,
    verifyUser
}