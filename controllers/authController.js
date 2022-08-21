import userModel      from '../models/user model.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt            from "jsonwebtoken"
import appError  from '../utils/appError.js';
import {promisify} from 'util';

const createToken = id =>{
  return jwt.sign({
      id
    }, process.env.JWT_SECRET,
    { expiresIn:process.env.JWT_EXPIRES_IN})
}

const signup = catchAsync(async (req,res,next)=>{

  const newUser = await userModel.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo:req.body.photo,
    passwordChangeAt: req.body.passwordChangeAt
  });

  const token = createToken(newUser._id);
  res.status(201).json({
    status:"success",
    token,
    data:{user:newUser}
  })
});

const login = catchAsync(async (req,res,next)=>{
  const {email, password} = req.body;
  // check if both email and password were provided
  if(!email || !password){
    return next(new appError("please provide email and password to login", 400))
  }
  const user = await userModel.findOne({email:email}).select("+password");

  // check if email exists or check if password is correct
  if(!user|| !await user.correctPassword(password)) {
    return next(new appError("Incorrect email or password", 400));
  }
  //generate jwt token for users who log in
  const token = createToken(user._id);
  res.status(201).json({
    status:"success",
    data:{token}
  })
});

const protect  = catchAsync(async (req,res,next)=>{
  let token;
  // check if token has a valid format
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer") ){
    token = req.headers.authorization.split(" ")[1];
  }


  // check if token exists
  if(!token){
    return next(new appError("User is unauthorized. Please log in to get access",401));
  }  //check if the jwt token is correct
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user of the token did not delete their account
  const user = await userModel.findById(decoded.id);
  if(!user){
    return next(new appError("The user was deleted. Please sign up to get access",401));
  }

  //check if password was changed before jwt token expired
  if(user.changedPasswordAfter(decoded.iat)){
    return next(new appError("The password was changed. Please log in to get access",401));
  }
  next();
})


export default {
  signup,
  login,
  protect
}