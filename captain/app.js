const dotenv = require('dotenv')
dotenv.config()
const express = require('express');
const app = express();
const captainRoutes = require("./routes/captain.route")
const cookieParser = require('cookie-parser')
const connect = require('./db/db')
const rabbitMq = require("./service/rabbit")


rabbitMq.connect();


connect();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use('/', captainRoutes)

module.exports = app;