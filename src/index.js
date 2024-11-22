const express = require('express');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');
const Routers =require('./routers/index');
const { createAllTables } = require('./models/index');
const bodyParser = require('body-parser');
const app = express();
dotenv.config();

connectDB().then(()=>{
    console.log('connected to SQL dataabase.');
}).catch((error)=>{
    console.log('SQL database connection error : ', error);
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

app.use('/', Routers)

setTimeout(createAllTables, 1000)

app.listen(process.env.PORT || 1002, ()=>{
    console.log(`server is runinng on http://localhost:${process.env.PORT || 1002}`);
})