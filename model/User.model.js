import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

// pre hook to hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(this.password, 10)
        this.password = hashedPassword
    }
    next()
})

const User = mongoose.model("user", userSchema)

export default User