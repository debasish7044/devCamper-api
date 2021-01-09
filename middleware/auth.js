const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('./async');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  //check if authorization has been set to token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(
      new ErrorResponce('Not authorize to access the route', 401)
    );
  }

  try {
    //compare token with user token && verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    next(new ErrorResponce('Not authorize to access the route', 401));
  }
});

// grant access to specific roles

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new ErrorResponce(
          `${req.user.role} role Not authorize to access the route`,
          401
        )
      );
    }
    next();
  };
};
