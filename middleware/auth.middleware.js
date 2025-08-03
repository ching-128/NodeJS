import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const isUserVarified = async (req, res, next) => {
    
    try {
        let token = req.cookies?.token
        if (!token) {
            return res.status(401).json({
                message: "Authentication failed",
                succes: false
            })
        }
        
        const decodedData = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decodedData

        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            succes: false
        })
    }
}

export { isUserVarified }