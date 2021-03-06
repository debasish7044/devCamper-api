const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

//@desc  Get all users
//@route Get /api/v1/auth/users
//@access private/admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc  Get single user
//@route Get /api/v1/auth/users/:id
//@access private/admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc  Create user
//@route Post /api/v1/auth/users/:id
//@access private/admin

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

//@desc  Update user
//@route Put /api/v1/auth/users/:id
//@access private/admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc  Delete user
//@route Delete /api/v1/auth/users/:id
//@access private/admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
