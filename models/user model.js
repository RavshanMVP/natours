import mongoose  from 'mongoose';
import validator from 'validator';
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema({
    name:{
      type:String,
      required: [true, "Please tell us your name"]
    },
    email:{
      type:String,
      required: [true, "Please provide your email"],
      unique:true,
      lowercase:true,
      validate: [validator.default.isEmail,"Please provide a VALID email"]
    },
  photo:{
    type:String,
  },
  password:{
    type:String,
    required: [true, "A user must have a password "],
    minLength:8,
    select:false

  },
  passwordConfirm:{
    type:String,
    required: [true, "A user must have a password confirmation"],
    minLength:8,
    validate:{
      //works only on save and create
      validator: function(el){
        return el === this.password
      },
      message:"Password must match"
    }
  },
  passwordChangedAt:{
      type:Date,
      default: Date.now()}
})

UserSchema.pre("save", async function(next){
  // run only if password was modified
  if (!this.isModified("password")){
    return next()
  }
  //hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password,12);
  //delete password confirmation
  this.passwordConfirm = undefined;
})

UserSchema.methods.correctPassword = async function(candidatePassword){
  return await bcrypt.compare(candidatePassword, this.password);
}

UserSchema.methods.changedPasswordAfter = async function(JWTTimeStamp){
  if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false
}
const UserModel = mongoose.model("User", UserSchema);
export default UserModel;