import appError from '../utils/appError.js';
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(message,400);
}

const handleDuplicatesErrorDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field ${field}: ${value}. Please enter another value`;
  return new appError(message,400);
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el=>el.message);
  const message = `Invalid inout data: ${errors.join(". ")}`;
  return new appError(message,400);
}

const handleInvalidToken = ()=>{
  return new appError("Invalid token. Please log in again", 401);
}

const handleExpiredToken = ()=>{
  return new appError("Your token has expired. Please log in again", 401);
}

const devError = (err,res)=>{
  res.status (err.statusCode).json ({
    status:err.status,
    message:err.message,
    stack:err.stack,
    error:err
  })
}

const prodError = (err,res)=>{
  if (err.isOperational){
    // operational error - usually incorrect requests by client
    res.status (err.statusCode).json ({
      status:err.status,
      message:err.message
    })
  }
  else{
    console.log("Error", err)
    // programming error - we don't want to show them to clients
    res.status(500).json({
      message:"Something went very wrong",
      status:"error"
    })
  }
}
export default (err, req, res, next)=>{
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(err);
  //  for development env, we give more specific information about errors
  if(process.env.NODE_ENV === "development"){
    devError(err,res)
  }

  //for production env
  else if(process.env.NODE_ENV === "production") {
    let error;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if(err.code === 11000) error = handleDuplicatesErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if(err.name === "JsonWebTokenError") error = handleInvalidToken();
    if(err.name === "TokenExpiredError") error = handleExpiredToken();
    console.log(error);
    prodError(error,res)
  }
}