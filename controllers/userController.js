
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//creating Refresh Token
const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_REFRESH_TOKEN, {
    expiresIn: "10d",
  });
};
//Creating Access Token
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_TOKEN, {
    expiresIn: "10d",
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    // if (!name || !email || !password) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please Enter all the Feilds" });
    // }

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please Enter Your name",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please Enter Your username",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Please Enter Your Password",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .send({ status: false, message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    if (user) {
      return res.status(201).send({
        success: true,
        message: "User Created Successfully",
        data: user,
      });
    } else {
      return res.status(400).send({ message: "user not found" });
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let refresh_Token
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please Enter Your Email",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Please Enter Your Password",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ success: false, message: "User Not Found" });
    }

    //to check if the password matches or not
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
     return res.status(400).send({
        success: false,
        message: "password didnot match,Try Again!!",
      });
    } else {
     refresh_Token = createRefreshToken({ id: user._id });
      await User.findOneAndUpdate(
        { email },
        {
          refresh_token: refresh_Token,
          refresh_token_expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }
      );
    }

    res.status(200).send({
      success: true,
      refresh_token: refresh_Token,
      message: "Login Successful",
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

exports.getAccessToken = async (req, res) => {
  try {
    let rf_token;
    console.log(req.query.email);

    if (req.query.email) {
      rf_token = await User.findOne({
        email: req.query.email,
        refresh_token_expiry: { $gt: Date.now() },
      });
    }

    console.log(rf_token, "<------------rf_token");

    if (!rf_token) {
      return res.send({ success: false, message: "Please login again" });
    }

    const logInUser = jwt.verify(
      rf_token.refresh_token,
      process.env.JWT_SECRET_REFRESH_TOKEN
    );

    console.log("logInUser------------------>",logInUser);

    if (!logInUser) {
      return res
        .status(400)
        .send({ success: false, message: "Please login again" });
    }

    const access_Token = createAccessToken({ _id: logInUser.id });
    console.log("access_Token------------------>",access_Token);

    res.status(200).send({ success: true, accessToken: access_Token });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

// Get All Users based on search

exports.allUsersBasedOnSearch = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    // console.log(req.user);
    console.log(keyword);
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    return res
      .status(200)
      .send({
        success: true,
        message: "users found successfully",
        data: users,
      });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

// Get Single User

exports.getSingleUser = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "User Not Found" });
    }
    return res
      .status(200)
      .send({ success: true, message: "user found successfully", data: user });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};


// get All User allUsers

exports.allUsers = async (req, res) => {
  try {

    const users = await User.find();
    if (!users) {
      return res
        .status(401)
        .send({ success: false, message: "Users Not Found" });
    }
    return res
      .status(200)
      .send({ success: true, message: "user found successfully", data: users });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};