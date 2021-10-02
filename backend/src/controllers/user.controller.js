const httpStatus = require('http-status');
const { omit } = require('lodash');
const User = require('../models/user.model');
const BlockedUser = require('../models/blockedUser.model');
const Restaurant = require('../models/restaurant.model');
const Order = require('../models/order.model');
const Meal = require('../models/meal.model');

const { Role } = require('../config/constants');
const APIError = require('../config/APIError');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.toJSON());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => res.json(req.user.toJSON());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.toJSON());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const ommitRole = req.user.role !== Role.Admin ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.locals.user, updatedUser);

  user.save()
    .then(savedUser => res.json(savedUser.toJSON()))
    .catch(e => next(User.checkDuplicateEmail(e)));
};

/**
 * Update existing user
 * @public
 */
exports.updateLoggedIn = (req, res, next) => {
  const user = Object.assign(req.user, req.body);

  user.save()
    .then(savedUser => res.json(savedUser.toJSON()))
    .catch(e => next(User.checkDuplicateEmail(e)));
};


/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    console.log("query",req.query)
    let users = await User.list(req.query);
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user list for restaurants
 * @public
 */
exports.listForRestaurant = async (req, res, next) => {
  try {
    let { restaurant } = req.locals;
    if (!restaurant.owner.equals(req.user._id)) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      throw error;
    }
    let users = await User.listForRestaurant({ ...req.query, restaurantId: restaurant.id });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Block user for restaurant
 * @public
 */
exports.blockUserForRestaurant = async (req, res, next) => {
  try {
    let { restaurant } = req.locals;
    let { userId } = req.body;
    if (!restaurant.owner.equals(req.user._id)) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      throw new error;
    }
    await BlockedUser.blockUser(restaurant.id, userId);
    res.status(httpStatus.OK).end();
  } catch (error) {
    next(error);
  }
};


/**
 * Unblock user for restaurant
 * @public
 */
exports.unblockUserForRestaurant = async (req, res, next) => {
  try {
    let { restaurant } = req.locals;
    let { userId } = req.body;
    if (!restaurant.owner.equals(req.user._id)) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      throw new error;
    }
    await BlockedUser.unblockUser(restaurant.id, userId);
    res.status(httpStatus.OK).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = async (req, res, next) => {
  const { user } = req.locals;

  try {
    await BlockedUser.deleteMany({ user: user._id });
    const restaurants = await Restaurant.find({ owner: user._id });
    for (let restaurant of restaurants) {
      await BlockedUser.deleteMany({ restaurant: restaurant._id });
      await Meal.deleteMany({ restaurant: restaurant._id });
      await Order.deleteMany({ restaurant: restaurant._id });
    }
    await Restaurant.deleteMany({ owner: user._id });
    await Order.deleteMany({ user: user._id });
    await user.remove();
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
};
