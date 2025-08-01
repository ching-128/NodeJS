import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVarified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    }
}, {
    createdAt: true,
    updatedAt: true,
    timestamps: true,
})

const User = mongoose.model("user", userSchema)

export default User