const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const APIError = require('../config/APIError');
const { env } = require('../config/config');


const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
  };

  console.log(err);
  res.status(err.status);
  res.json(response);
};
exports.handler = handler;

exports.converter = (err, req, res, next) => {
  let convertedError = err;
  
  if (err instanceof expressValidation.ValidationError) {
    convertedError = new APIError({
      message: 'Validation Error',
      errors: err.details,
      status: err.statusCode,
    });
  } else if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
    });
  }

  return handler(convertedError, req, res);
};


exports.notFound = (req, res, next) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
  });
  return handler(err, req, res);
};
