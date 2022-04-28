const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config({path:"./config/config.env"})


const connectDatabase  = ()=>{
    mongoose.connect("mongodb+srv://iappstudio:iApp456@cluster0.yl8hz.mongodb.net/shopnow",{useNewUrlParser:true,useUnifiedTopology:true,
    }).then(()=>{
        console.log("connected mongodb")
    })
}

module.exports = connectDatabase