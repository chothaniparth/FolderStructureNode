const { pool } = require('mssql');
const bcrypt = require('bcrypt');
const {checRequiredKeyValues, errorMessage, successMessage, generateJWTT} = require('../../config/common');

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

const createUser = async (req, res)=>{
    try{
        const { Fname, Lname, DOB, Email, Password} = req.body;
        const missingKeys = checRequiredKeyValues(['Fname', 'Lname', 'DOB', 'Email', 'Password'], req.body);
        if(missingKeys.length > 0){
            return res.status(400).send(`${missingKeys.join(', ')} is required.`);
        }
        const salt = bcrypt.genSaltSync(5);
        const hash = bcrypt.hashSync(Password, salt);

        const result = await pool.request().query(`
            INSERT INTO Users (
                Fname, Lname, DOB, Email, Password
            )
            OUTPUT INSERTED.UserId
            VALUES (
                '${Fname}', '${Lname}', '${DOB}', '${Email}', '${hash}'
            );
        `)
        console.log(result);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No user created.'));
        }
        return res.status(200).send({...successMessage('Data inserted successfully.'), token : generateJWTT({UserId : result?.recordset?.[0]?.UserId, Email})});
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
        Fname = @Fname, 
        Lname = @Lname, 
        DOB = @DOB, 
        Email = @Email
        WHERE UserId = @UserId
        `
        const result = await pool.query(updateQuery, {Fname, Lname, DOB, Email, UserId});

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
            return res.status(400).send(`${missingKeys.join()} is required`);
        }
        const DeleteQuery = `DELETE FROM Users  WHERE UserId = @UserId`

        const result = await pool.query(DeleteQuery, {UserId});

        if(result.recordset[0] === 0){
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
    createUser,
    updateuser,
    deleteUser,
}