import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get data from user
  const { username, email, password, phoneNumber, role } = req.body;

  if (username === "") {
    throw new ApiError(400, "username is requird");
  }
  if (email === "") {
    throw new ApiError(400, "email is requird");
  }
  if (password === "") {
    throw new ApiError(400, "password is requird");
  }
  if (phoneNumber === "") {
    throw new ApiError(400, "phoneNumber is requird");
  }
  if (role === "") {
    throw new ApiError(400, "role is requird");
  }

  //check for user is already exist or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username is already exist");
  }

  //create a new user and save to db
  const user = await User.create({
    username,
    password,
    email,
    phoneNumber,
    role,
  });

  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registring the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // fetch data from user
  const { username, email, password, role } = req.body;

  //check for empty field
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  if (password === "") {
    throw new ApiError(400, "password is requird");
  }
  if (role === "") {
    throw new ApiError(400, "role is requird");
  }

  //check user exist or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  //if exist then check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //check roll is correct or not
  if (role !== user.role) {
    throw new ApiError(401, "Account doesn't exist with current role");
  }
  //if user exist then generate access and refresh Tokens
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const updateprofile = asyncHandler(async (req, res) => {
  //check user is login or not -- using middleware
  //get data from user body
  const { username, email, phoneNumber, password, bio, skills } = req.body;

  let skillsArray;
  if (skills) {
    skillsArray = skills.split(",");
  }
  //update from database
  const user = await User.findById(req.user?._id);

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (bio) user.profile.bio = bio;
  if (skills) user.profile.skills = skillsArray;

  await user.save();

  // Exclude the password from the returned document here we can not use .select() method.
  const updatedUser = user.toObject();
  delete updatedUser.password;

  //send success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Profile details updated successfully")
    );
});
export { registerUser, loginUser, logoutUser, updateprofile };
