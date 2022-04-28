const ErrorHandler = require("../utils/errorHandler")
const catchAsyncerror  = require("../middlewares/catchAsyncErrors")
const User = require("../models/User")
const sendToken= require("../utils/sendTokenCookies")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const jwt = require("jsonwebtoken");

//register user  
const cloudinary = require("cloudinary")
exports.registerUser = catchAsyncerror(async(req,res,next)=>{
    const result = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder: 'avatar',
        width:150,
        crop:"scale"

    }) 
    const {name ,email,password} = req.body 
    const user =  await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:result.public_id,
            url:result.secure_url
        }
    })
    res.status(201).json({
    success:true,
user    })
})
//login user

exports.loginUser = catchAsyncerror(async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }
   sendToken(user,200,res)
})
// Logout user   =>   /api/v1/logout
exports.logout = catchAsyncerror(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})
// Forgot Password   =>  /api/v1/password/forgot
exports.forgotPassword = catchAsyncerror(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });
    console.log(user)

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {

        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

})


exports.resetPassword = catchAsyncerror(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
console.log(req.params.token)
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})

exports.getProfile = catchAsyncerror(async(req,res,next)=>{
    let user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        user
    })

})
// Update / Change password   =>  /api/v1/password/update
exports.updatePassword = catchAsyncerror(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');
    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    console.log(isMatched)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect'));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res)

})
// Update user profile   =>   /api/v1/me/update
exports.updateProfile = catchAsyncerror(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar
  
    if (req.body.avatar !== '') {
        const user = await User.findById(req.user.id)

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})

// Get all users  

exports.allUsers = catchAsyncerror(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

// Get user details   =>   /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncerror(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})


// Update user profile   =>   /api/v1/admin/user/:id
exports.updateUser = catchAsyncerror(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

// Delete user   =>   /api/v1/admin/user/:id
exports.deleteUser = catchAsyncerror(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

  

    await user.remove();

    res.status(200).json({
        success: true,
    })
})
// get user   =>   /api/v1/admin/user/:id
exports.user = catchAsyncerror(async (req, res, next) => {

    
    const token  = req.params.id
    console.log(token)

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);
    console.log(req.user)
  let users  = req.user


    res.status(200).json({
        success: true,
        users
    })
})

