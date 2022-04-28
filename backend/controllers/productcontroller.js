const Product = require("../models/Product")
const items = require("../data/items")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncerror = require("../middlewares/catchAsyncErrors")
const apiFeatures = require("../utils/apiFeatures")
const APIFeatures = require("../utils/apiFeatures")
const cloudinary = require('cloudinary')

exports.newProducts = catchAsyncerror(async(req,res,next)=>{
console.log(req.body)
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks
    req.body.user = req.user.id;
    const product = await Product.create(req.body).catch((Err)=>(
        console.log(Err)
    ))

    res.status(201).json({
        success: true,
        product
    })
})

//get all products
exports.getProducts = async (req,res,next)=>{
    const resPerpage = 4
    const apiFeatures = new APIFeatures(Product.find(),req.query).search().filter().pagination(resPerpage)
    const products = await apiFeatures.query
    let filteredProductsCount = products.length;

    // return next(new ErrorHandler("my error",400))
 setTimeout(async() => {
    const product = await Product.find()
    

    res.status(200).json({
        success: true,
        productsCount:product.length,
        resPerpage,
        filteredProductsCount,
        products
    })
 },1000);
   

}

// get single products details
 exports.getsingleProduct = catchAsyncerror(async(req,res,next)=>{
     const item = await Product.findById(req.params.id)

     if(!item){
         return next(new ErrorHandler("Product not found",404))
     }

     res.status(200).json({
         success:true,
         item
     })
 })
 // Update Product   =>   /api/v1/admin/product/:id
exports.productUpdate = catchAsyncerror(async (req, res, next) => {

    let product = await Product.findById(req.query.product);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (images !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        req.body.images = imagesLinks

    }



    product = await Product.findByIdAndUpdate(req.query.product, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })

})


 // update products
 exports.productDelete = catchAsyncerror(async(req,res,next)=>{
    let item = await Product.findById(req.query.product)
    console.log("THIS IS " +req.query.product)

    if(!item){
        return next(new ErrorHandler("Product not found",404))

    }

    await item.remove()
    res.status(200).json({
        success:true,
        message:"product  deleted"
    })

    
})

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncerror(async (req, res, next) => {

    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)
    console.log(product)
// find the review that matches the logged in user id finding with req.user._id by auth middleware
const isReviewed = product.reviews.find(
    r =>  String(r.user) === String(req.user._id)
)
console.log(req.user._id)


    if (isReviewed) {
        product.reviews.forEach(review => {
                review.comment = comment;
                review.rating = rating;
                console.log(review)
            
        })

    } else {
        product.reviews.push(review);
        product.numofReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    product.numofReviews = product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncerror(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})
// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncerror(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

// this filter remove the req.query.id review then 
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    console.log(reviews);

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
// here we adding the remaining filter reviews here
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

// Get all products (Admin)  =>   /api/v1/admin/products
exports.getAdminProducts = catchAsyncerror(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })

})
