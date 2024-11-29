const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const {checRequiredKeyValues, errorMessage, successMessage, generateJWTT, getCommonAPIResponse, generateCGUID} = require('../../config/common');
const {createAllTables, createDatabase} = require('../../models/index');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const getUserById = async (req, res) => {
    try{
        const {UserId} = req.query;
        let whereConditions = [];

        if(UserId){
            whereConditions.push(`UserId = ${UserId}`)
        }

        const whereString = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const getCarouselList = {
            getQuery: `SELECT * FROM Users ${whereString} `,
            countQuery: `SELECT COUNT(*) AS totalCount FROM Users ${whereString}`,
        };
        const result = await getCommonAPIResponse(req, res, getCarouselList);
        return res.json(result);
    }catch(error){
        console.log('get User by Id Error :', error);
    }
}

const UserLogin = async (req, res) => {
    try {
        const { Email, Password, Mode = 'L' } = req.body;

        if (Mode === "L") {
            // Validate required fields for login
            const missingKeys = checRequiredKeyValues(['Email', 'Password'], req.body);
            if (missingKeys.length > 0) {
                return res.status(400).json(errorMessage(`${missingKeys.join(', ')} is required`));
            }

            // Fetch user details
            const fetchUserInfoQuery = `
            SELECT * FROM docker.dbo.Users WHERE Email = '${Email}'
            `;
            const result = await pool.request().query(fetchUserInfoQuery);

            if (result.recordset.length === 0) {
                return res.status(400).json({ ...errorMessage('Invalid Email or Password.'), isLoginedIn: false });
            }

            // Verify password
            const verifyUser = bcrypt.compareSync(Password, result?.recordset?.[0]?.Password);
            if (result.recordset.length > 0 && verifyUser === true) {
                // Generate token
                const token = generateJWTT({
                    UserId: result?.recordset?.[0]?.UserId,
                    Email,
                    CGUID: result?.recordset?.[0]?.CGUID,
                });

                return res.status(200).json({
                    ...successMessage('User Email and Password is valid'),
                    isLoginedIn: true,
                    Email,
                    UserId: result?.recordset?.[0]?.UserId,
                    CGUID: result?.recordset?.[0]?.CGUID,
                    token,
                });
            }

            return res.status(400).json({ ...errorMessage('Invalid Email or Password.'), isLoginedIn: false });
        } else if (Mode === 'VT') {
            // Verify token
            let token = req.headers['authorization'];
            if (!token) {
                return res.status(401).json(errorMessage("A token is required for authentication"));
            }

            try {
                token = token.replace(/Bearer\s/i, "");
                const decoded = jwt.verify(token, process.env.SECRET_KEY);

                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                const timeToExpire = decoded.exp - currentTime; // Time remaining for token expiration in seconds
                const fortyEightHours = 48 * 60 * 60; // 48 hours in seconds

                if (timeToExpire <= fortyEightHours) {
                    // Generate new token if the current one is expiring soon
                    const newToken = generateJWTT({
                        UserId: decoded.UserId,
                        Email: decoded.Email,
                        CGUID: decoded.CGUID,
                    });

                    return res.status(200).json({
                        ...successMessage('Token is expiring soon. A new token is generated.'),
                        token: newToken,
                        isLoginedIn: true
                    });
                }

                req.user = decoded;
                return res.status(200).json({
                    ...successMessage('Token is valid'), 
                    isLoginedIn: true}
                );
            } catch (err) {
                return res.status(401).json({
                    ...errorMessage(err?.message || "Invalid Token"),
                    isLoginedIn: true
                });
            }
        }

        return res.status(400).json({ ...errorMessage('Invalid Email or Password.'), isLoginedIn: false });
    } catch (error) {
        console.log('Login User Error: ', error);
        return res.status(500).json(errorMessage(error.message));
    }
};

const createUser = async (req, res)=>{
    try{
        const { Fname, Lname, DOB, Email, Password} = req.body;
        const missingKeys = checRequiredKeyValues(['Fname', 'Lname', 'DOB', 'Email', 'Password'], req.body);
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys.join(', ')} is required.`));
        }
        const salt = bcrypt.genSaltSync(5);
        const hash = bcrypt.hashSync(Password, salt);
        const CGUID = await generateCGUID(Fname);
        const result = await pool.query(`
            INSERT INTO Users (
                Fname, Lname, DOB, Email, Password, CGUID
            )
            OUTPUT INSERTED.UserId
            VALUES (
                '${Fname}', '${Lname}', '${DOB}', '${Email}', '${hash}', '${CGUID}'
            );
        `)
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No user created.'));
        }
        createDatabase(CGUID);
        createAllTables(CGUID);
        return res.status(200).send({...successMessage('Data inserted successfully.'), token : generateJWTT({UserId : result?.recordset?.[0]?.UserId, Email, CGUID}), CGUID});
    }catch(error){
        console.log('Add User Error :', error);
        return res.status(500).send(errorMessage(error.message));
    }
}

const updateuser = async (req, res) =>{
    try{
        const {Fname, Lname, DOB, Email, UserId} = req.body;
        const missingKeys = checRequiredKeyValues(['Fname', 'Lname', 'DOB', 'Email', 'UserId'], req.body);
        if (missingKeys.length > 0) {
            return res.status(400).json(errorMessage(`${missingKeys.join(', ')} is required`));
        }
        const updateQuery = `
        UPDATE Users SET
        Fname = '${Fname}', 
        Lname = '${Lname}', 
        DOB = '${DOB}', 
        Email = '${Email}'
        WHERE UserId = ${UserId}
        `
        const result = await pool.request().query(updateQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json(errorMessage('No User Updated.'));
        }

        return res.status(200).json(successMessage('User Updated Successfully.'));
    }catch(error){
        console.log('Update User Error :', error);
        return res.status(500).json(errorMessage(error.message))
    }
}

const deleteUser = async (req, res) =>{
    try{
        const {UserId} = req.query;
        const missingKeys = checRequiredKeyValues(['UserId'], req.query)
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`${missingKeys.join()} is required`));
        }
        const DeleteQuery = `DELETE FROM Users  WHERE UserId = ${UserId}`

        const result = await pool.query(DeleteQuery);

        if(result.rowsAffected[0] === 0){
            return res.status(400).json(errorMessage(`No User Deleted.`));
        }
        
        return res.status(200).json(successMessage('User Deleted SuccessFully.'));
    }catch(error){
        console.log('Delete User Error :', error);
        return res.status(500).json(errorMessage(error.message))
    }
}

module.exports = {
    getUserById,
    UserLogin,
    createUser,
    updateuser,
    deleteUser,
}