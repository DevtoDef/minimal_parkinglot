const jwt = require('jsonwebtoken');
const cookie = require('cookie');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        const accessToken = authHeader.split(' ')[1];
        //decode accessToken
        await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            req.user = decoded.UserInfo.username;
            req.role = decoded.UserInfo.role;
            next()
        })
    } catch (err) {
        res.status(403).json({"Error": "Forbidden", "message": err.message});
    }
}

module.exports = verifyJWT;