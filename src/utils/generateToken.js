require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token for a user
 * @param {string} userId - userId from db
 * @param {string} role - role of user (viewer, analyst, admin)
 * @returns {string} signed jwt
 */

const generateToken = (userId , role)=>{
    const SECRET = process.env.JWT_SECRET || 'SECRET';

    const token = jwt.sign(
        {
            userId : userId,
            role:role
        },
        SECRET,
        {
            expiresIn : '1d'
        }
    );

    return token;
}

module.exports = generateToken;