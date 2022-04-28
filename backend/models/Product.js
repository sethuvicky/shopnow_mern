const mongoose = require("mongoose") 

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"],
        trim: true,
        maxlength:[100,"product name cannot exceed 100 charecter"]
    },
    price:{
        type:Number,
        required:[true,"please enter product price"],
        maxlength:[5,"product name cannot exceed 5 charecter"],
        default:0.0
    },
    description:{
        type:String,
        required:[true,"please enter product description"],
        
    },
    ratings:{
        type:Number,
        default:0
        
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
        
    }],
    category:{
        type:String,
        required:[true,"Please enter category of product"],
        enum:{
            values:[
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                "Books",
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message:"please select correct category  for product"
        } 
    },
    seller:{
        type:String,
        required:[true,"please enter product seller"]
    },
    stock:{
        type:Number,
        required:[true,"please enter product stock"],
        maxlength: [5,"product name cannot exceed 5 charecters"],
        default:0
    },
    numofReviews:{
        type:Number,
        default:0
    },
    reviews:[
        { user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }


})
let Product = mongoose.model("Product",productSchema)

module.exports =  Product