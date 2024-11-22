const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');
dotenv.config();
const {DATABASE_USER, DATABASE_PASSWORD, DATABASE_SERVER, DATABASE_NAME} = process.env

const config = {
    server : DATABASE_SERVER,
    user : DATABASE_USER,
    password : DATABASE_PASSWORD,
    database : DATABASE_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection : true
    }
}

const pool = new sql.ConnectionPool(config);

const connectDB = async ()=>{
    try{
        await pool.connect();
        // console.log('connected to SQL server.');
    }catch(error){
        console.log('SQL server connection error : ', error);
    }
}

module.exports = {
    sql, 
    pool,
    connectDB
}