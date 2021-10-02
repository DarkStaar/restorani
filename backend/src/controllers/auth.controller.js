const httpStatus = require("http-status");
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const moment = require("moment-timezone");
const { jwtExpirationInterval } = require("../config/config");

function generateTokenResponse(user, accessToken) {
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, "minutes");
  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Returns jwt token if registration was successful
 */
exports.register = async (req, res, next) => {
  try {
    const userData = req.body;
    const user = await new User(userData).save();
    const userObject = user.toJSON();
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userObject });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userObject = user.toJSON();
    return res.json({ token, user: userObject });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update profile
 */
exports.updateProfile = (req, res, next) => {
  const user = Object.assign(req.user, req.body);

  user
    .save()
    .then((savedUser) => res.json(savedUser.toJSON()))
    .catch((e) => next(User.checkDuplicateEmail(e)));
};

/**
 * Returns a new jwt when given a valid refresh token
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({
      email,
      refreshObject,
    });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
