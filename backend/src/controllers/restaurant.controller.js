const httpStatus = require('http-status');
const Restaurant = require('../models/restaurant.model');
const Meal = require('../models/meal.model');
const Order = require('../models/order.model');
const BlockedUser = require('../models/blockedUser.model');

const { Role } = require('../config/constants');
const APIError = require('../config/APIError');

/**
 * Load restaurant from restaurantId and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const restaurant = await Restaurant.get(id);
    req.locals = { restaurant };
    return next();
  } catch (error) {
    return next(error);
  }   
};

/**
 * Get restaurant
 */
exports.get = (req, res) => res.json(req.locals.restaurant.toJSON());


/**
 * Create new restaurant
 */
exports.create = async (req, res, next) => {
  try {
    const restaurant = new Restaurant(req.body);
    restaurant.owner = req.user;
    const savedRestaurant = await restaurant.save();
    res.status(httpStatus.CREATED);
    res.json(savedRestaurant.toJSON());
  } catch (error) {
    next(error);
  }
};


/**
 * Update existing restaurant
 */
exports.update = (req, res, next) => {
  const restaurantData = req.body;
  if (!req.locals.restaurant.owner.equals(req.user.id)) {
    const error = new APIError({
      message: "You don't have permission.",
      status: httpStatus.FORBIDDEN
    });
    return next(error);
  }

  const restaurant = Object.assign(req.locals.restaurant, restaurantData);
  restaurant.save()
    .then(savedRestaurant => res.json(savedRestaurant.toJSON()))
    .catch(e => next(e));
};

/**
 * Get restaurant list
 */
exports.list = async (req, res, next) => {
  try {
    let restaurants = await Restaurant.list({ ...req.query });
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
};

/**
 * Get restaurant list
 */
exports.listOwned = async (req, res, next) => {
  try {
    const { user } = req;
    let restaurants = await Restaurant.list({ ...req.query, ownerId: user.id });
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete restaurant
 */
exports.remove = async (req, res, next) => {
  const { restaurant } = req.locals;

  if (!req.locals.restaurant.owner.equals(req.user._id)) {
    const error = new APIError({
      message: "You don't have permission.",
      status: httpStatus.FORBIDDEN
    });
    return next(error);
  }

  try {
    await BlockedUser.deleteMany({ restaurant: restaurant._id });
    await Meal.deleteMany({ restaurant: restaurant._id });
    await Order.deleteMany({ restaurant: restaurant._id });
    await restaurant.remove();
    res.status(httpStatus.NO_CONTENT).end()
  } catch (e) {
    next(e);
  }
};
