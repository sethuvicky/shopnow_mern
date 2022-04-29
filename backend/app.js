const express = require('express');
const app = express();

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors  = require("cors")
// const dotenv = require('dotenv');
const path = require('path')
const dotenv = require("dotenv")
const errorMiddleware = require('./middlewares/errors')

// Setting up config file 
if (process.env.NODE_ENV !== 'PRODUCTION') require('dotenv').config({ path: 'backend/config/config.env' })
// dotenv.config({ path: 'backend/config/config.env' })

app.use(cors({origin: 'http://localhost:3000',
credentials: true,}))
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(fileUpload());
dotenv.config({path:"./config/config.env"})


// Import all routes
const products = require('./route/product');
const auth = require('./route/authRouter');
const order = require('./route/Order');
const payment = require("./route/Paymentprocess")

app.use('/api/v1', products)
app.use('/api/v1', auth)
app.use('/api/v1', order)
app.use('/api/v1', payment)

if (process.env.NODE_ENV) {
    app.use(express.static(path.join(__dirname, "../frontend/build")))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    })
}


// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app