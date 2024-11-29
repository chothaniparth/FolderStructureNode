const {createUsersTableQuery} = require('./schema/userSchema');
const {pool} = require('../config/db');


const executeQuery = async (query) => {
    try {
        const result = await pool.request().query(query);
        // console.log('Table creation result:', result);
    } catch (error) {
        // console.error('Error creating table:', error.message);
    }
};

const createDatabase = async (CGUID)=>{
    try{
        await pool.request().query(`CREATE DATABASE ${CGUID}`)
        console.log('new database created of name : ', CGUID);
        return {Success : true}
    }catch(error){
        console.log('CREATE DATABASE Error :', error);
        return {Success : false}
    }
}

const createAllTables = async (CGUID) => {
    try {
        await executeQuery(createUsersTableQuery(CGUID));
        console.log('All tables created successfully.');
    } catch (error) {
        console.error('Error during table creation process:', error.message);
    }
};

module.exports = {
    createAllTables,
    createDatabase,
}