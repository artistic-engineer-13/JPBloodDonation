const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { USER_ROLES } = require('../constants/enums');
const { authResponse } = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    role,
    hospitalName,
    licenseNumber,
    bloodGroup,
    age,
    gender,
    medicalEligibility,
    neededBloodGroup,
    bloodGroupNeeded,
  } = req.body;

  if (!name || !email || !password || !phone || !address || !role) {
    throw new ApiError(400, 'name, email, password, phone, address, and role are required');
  }

  const normalizedRole = String(role).trim().toUpperCase().replace(/\s+/g, '_');

  if (!Object.values(USER_ROLES).includes(normalizedRole)) {
    throw new ApiError(400, 'Invalid role value');
  }

  const normalizedGender = gender ? String(gender).trim().toUpperCase() : null;
  const normalizedBloodGroup = bloodGroup ? String(bloodGroup).trim().toUpperCase() : null;
  const normalizedNeededBloodGroup = (neededBloodGroup || bloodGroupNeeded)
    ? String(neededBloodGroup || bloodGroupNeeded)
        .trim()
        .toUpperCase()
    : null;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    fullName: name,
    email,
    password,
    phone,
    address,
    role: normalizedRole,
    hospitalName,
    licenseNumber,
    bloodGroup: normalizedBloodGroup,
    age,
    gender: normalizedGender,
    medicalEligibility,
    neededBloodGroup: normalizedNeededBloodGroup,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: authResponse(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is inactive. Contact admin');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: authResponse(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user profile fetched',
    data: {
      user: req.user.toSafeObject(),
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
