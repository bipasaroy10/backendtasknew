import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";


const signupUser = asyncHandler(async(req,res) => {
  const { username , email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  //console.log("email: ",email);

  if (
    [ email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "email or username already exists");
  }


 const user = await User.create({
    email,
    password,
    username: username.toLowerCase(),
  });

  const finduser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!finduser) {
    throw new ApiError(500, "somthing went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, finduser, "user successfully registered"));

     
});


const signinUser = asyncHandler(async(req,res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    console.log(user,"sjhfg")
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password,user.password);
    console.log(isMatch,"ashd")
    if (isMatch){
      console.log(isMatch,"ismatch")
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


export {

    registerUser,
    signupUser,
    signinUser
}