const ErrorResponce = require('../utils/errorResponce');

const errorHandlers = (err, req, res, next) => {
  let error = { ...err };
  //console for dev

  //Mongoose bad object id
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponce(message, 404);
  }

  //Mongoose duplicate keys
  if (err.code === 11000) {
    const message = `'${err.keyValue.name}' is a duplicate field`;
    error = new ErrorResponce(message, 400);
  }

  //Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(
      (val) => val.message
    );
    console.log(message);
    error = new ErrorResponce(message, 400);
  }

  //sending error responce
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || err.message,
  });
};

module.exports = errorHandlers;
