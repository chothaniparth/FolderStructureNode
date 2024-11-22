const { pool } = require('mssql');
const bcrypt = require('bcrypt');
const {checRequiredKeyValues, errorMessage, successMessage, generateJWTToken} = require('../config/common');

const createUser = async (req, res)=>{
    try{
        const {Fname, Lname, DOB, Email, Password} = req.body;
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
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No user created.'));
        }
        return res.status(200).send({...successMessage('Data inserted successfully.'), token : generateJWTToken({})});
    }catch(error){
        return res.status(500).send(errorMessage(error.message));
    }
}

const updateuser = async (req, res) =>{
    try{

    }catch(error){

    }
}

const deleteUser = async (req, res) =>{
    try{

    }catch(error){

    }
}

module.exports = {
    createUser,
    updateuser,
    deleteUser,
}