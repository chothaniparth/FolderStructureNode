const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { pool } = require('./db');
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
    // message = errorMessageHandler(message);
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

const generateJWTT = (Payload)=>{
    return jwt.sign(Payload , process.env.SECRET_KEY);
}

const getCommonAPIResponse = async (req, res, query) => {
    if (req.query.Page && req.query.PageSize) {
        return await getCommonAPIResponseWithPagination(req, res, query);
    }
    try {
        const result = await pool.request().query(query.getQuery);
        const countResult = await pool.request().query(query.countQuery);
        const totalCount = countResult.recordset[0].totalCount;
        return {
            data: result.recordset,
            totalLength: totalCount
        }
    } catch (error) {
        console.error('Error:', error);
        return errorMessage(error?.message);
    }
}

const getCommonAPIResponseWithPagination = async (req, res, query) => {
    try {
        const page = req.query.Page || 1; // Default page number is 1
        const pageSize = req.query.PageSize || 10; // Default page size is 10
        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;
        const paginationQuery = `${query.getQuery} OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
        const result = await pool.request().query(paginationQuery);
        // Fetch total length of Carousel table
        const countResult = await pool.request().query(query.countQuery);
        const totalCount = countResult.recordset[0].totalCount;
        // Return data along with total length
        return {
            data: result.recordset,
            totalLength: totalCount
        }
    } catch (error) {
        console.error('Error:', error);
        return errorMessage(error?.message);
    }
}

const generateCGUID = async (Fname) => {
    if (!Fname || Fname.length < 3) {
        throw new Error('Fname must be at least 3 characters long');
    }
    const d = new Date();
    const timeValue = d.getTime().toString(); // Get timestamp as a string
    const lastThreeDigits = timeValue.slice(-3); // Extract the last three digits of the timestamp
    const firstThreeChars = Fname.slice(0, 3).toUpperCase(); // Extract the first three characters of Fname
    return `${firstThreeChars}${lastThreeDigits}`; // Combine the values
};

module.exports = {
    checRequiredKeyValues,
    errorMessage,
    successMessage,
    generateJWTT,
    getCommonAPIResponse,
    getCommonAPIResponseWithPagination,
    generateCGUID,
}