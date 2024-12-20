const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const { errorMessage } = require("../config/common");
dotenv.config();
const {SECRET_KEY} = process.env;

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send(errorMessage("A token is required for authentication"));
    }
    try {
        token = token.replace("Bearer ", "");
        token = token.replace("bearer ", "");
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send(err?.message || "Invalid Token");
    }
    return next();
};

module.exports = verifyToken;
