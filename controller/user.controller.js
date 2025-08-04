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
            return res.status(400).json({
                message: "Request body is missing",
                success: false
            });
        }

        const { name, email, password } = req.body;

        // Check if any required field is missing
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "The user already existed",
                success: false
            });
        }

        const user = await User.create({
            name,
            email,
            password
        })

        if (!user) {
            return res.status(400).json({
                message: "user not registered",
                success: false
            })
        }

        const token = crypto.randomBytes(32).toString("hex")
        user.verificationToken = token
        await user.save()

        // send email
        const transporter = nodemailer.createTransport({
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
            subject: 'Verification Mail',
            text: `Please click the following link below to verify your email :
            ${process.env.BASE_URL}/api/v1/users/verify/${user.verificationToken}`,
            html: `<h2>Varification Email</h2><p>Please click the link below to varify your email:</p><a href="${process.env.BASE_URL}/api/v1/users/verify/${user.verificationToken}">Varify Email</a>`,
        }

        transporter.sendMail(mailOptions)


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

        const user = await User.findOne({ email })

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
                success: false
            })
        }

        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPRAIR_IN
        })

        const cookieOptions = {
            httpOnly: true,
            secure: false,
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
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

const getUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false
            });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            success: true,
            user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: false,
            expires: new Date(0)
        }
        res.cookie("token", "", cookieOptions)
        res.status(200).json({
            message: "User succesfully logged out",
            success: true
        })
    } catch (error) {
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
            message: "Invalid Token",
            success: false
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

const forgotPassword = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                message: "Request body is missing",
                success: false
            });
        }
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000
        await user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: '"Testing Team" <noreply@creativedesk.org.in>',
            to: user.email,
            subject: 'Password Reset Request',
            text: `Please click the following link to reset your password:
            ${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}`,
            html: `<h2>Password Reset</h2><p>Please click the link below to reset your password:</p><a href="${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}">Reset Password</a>`,
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({
                    message: "Error sending email",
                    success: false
                });
            }

            return res.status(200).json({
                message: "Password reset email sent successfully",
                success: true
            })
        })

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

const resetPassword = async (req, res) => {
    try {
        if (!req.body || !req.params.resetToken) {
            return res.status(400).json({
                message: "Request body is missing",
                success: false
            });
        }
        const resetToken = req.params.resetToken;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                success: false
            })
        }

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token",
                success: false
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Password reset successfully",
            success: true
        })
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}



export {
    registerUser,
    loginUser,
    logoutUser,
    verifyUser,
    getUser,
    forgotPassword,
    resetPassword
}