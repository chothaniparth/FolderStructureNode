const {createUsersTableQuery} = require('./schema/userSchema');
const {pool} = require('../config/db');


const executeQuery = async (query) => {
    try {
        const result = await pool.request().query(query);
        // console.log('Table creation result:', result);
    } catch (error) {
        console.error('Error creating table:', error.message);
    }
};

const createAllTables = async () => {
    try {
        await executeQuery(createUsersTableQuery);
        console.log('All tables created successfully.');
    } catch (error) {
        console.error('Error during table creation process:', error.message);
    }
};

module.exports = {
    createAllTables,
}