require('dotenv').config();
const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
    try {

        const bearer = req.headers.authorization;

        if (!bearer || !bearer.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Access Denied . No token Provided."
            });
        }

        const token = bearer.split(' ')[1];

        const SECRET = process.env.JWT_SECRET || 'SECRET';

        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        console.log("Token is Valid", decoded);
        next();
    } catch (error) {
        console.error("Token Invalid or expired ", error.message);
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });
    }

}

module.exports = VerifyToken;