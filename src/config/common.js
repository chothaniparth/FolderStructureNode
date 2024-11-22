const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

const checRequiredKeyValues = (allKeys, matchKeys) => {
    const errorKeys = [];
    allKeys.map((item) => {
        if (!Object.keys(matchKeys).includes(item) || matchKeys[item] === undefined || matchKeys[item] === null || matchKeys[item] === '') {
            errorKeys.push(item);
        }
    });
    return errorKeys;
};

const errorMessage = (message = "Something went wrong!",status = 400) => {
    message = errorMessageHandler(message);
    return {
        Success: false,
        status,
        message
    }
}

const successMessage = (message = "successfully!") => {
    return {
        Success: true,
        status: 200,
        message
    }
}

const generateJWTToken = (Payload)=>{
    return jwt.sign(Payload , process.env.SECRET_KEY);
}

module.exports = {
    checRequiredKeyValues,
    errorMessage,
    successMessage,
    generateJWTToken,
}