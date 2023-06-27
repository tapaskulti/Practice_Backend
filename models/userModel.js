const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: [true, "enter the name"],
  },
  email: {
    type: "String",
    unique: [true, "email is  alraedy been used"],
    required: [true, "email is mandatory"],
  },
  password: {
    type: "String",
    required:[true, "please enter your password"],
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  refresh_token:{
    type:String
  },
  refresh_token_expiry:{
    type:Date
  },
  forgotPasswordToken: {
    type: String,
  },
  forgotPasswordExpiry: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
