const httpStatus = require('http-status');
const APIError = require('../config/APIError');
const Meal = require('../models/meal.model');
const Restaurant = require('../models/restaurant.model');
const BlockedUser = require('../models/blockedUser.model');

/**
 * Load meal from mealId and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const meal = await Meal.get(id);
    req.locals = { meal };
    return next();
  } catch (error) {
    return next(error);
  }   
};

/**
 * Get meal
 */
exports.get = (req, res) => res.json(req.locals.meal.toJSON());


/**
 * Create new meal
 */
exports.create = async (req, res, next) => {
  try {
    const { restaurantId } = req.body;
    const restaurant = await Restaurant.get(restaurantId);
    if (!restaurant.owner.equals(req.user.id)) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      throw error;
    }

    const meal = new Meal(req.body);
    meal.restaurant = restaurant;
    const savedMeal = await meal.save();
    res.status(httpStatus.CREATED);
    res.json(savedMeal.toJSON());
  } catch (error) {
    next(error);
  }
};


/**
 * Update existing meal
 */
exports.update = async (req, res, next) => {
  try {
    const mealData = req.body;
    const restaurantId = req.locals.meal.restaurant;
    const restaurant = await Restaurant.get(restaurantId);
    if (!restaurant.owner.equals(req.user.id)) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      throw error;
    }

    const meal = Object.assign(req.locals.meal, mealData);
    const savedMeal = await meal.save();
    res.json(savedMeal.toJSON());

  } catch (error) {
    next(error);
  }
  
};

/**
 * Get meal list
 */
exports.list = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    if (restaurantId) {
      const blocked = await BlockedUser.blocked(restaurantId, req.user.id);
      if (blocked) {
        throw new APIError({
          message: 'You have been blocked from accessing this restaurant by the restaurant owner. Please contact restaurant owner.',
          status: httpStatus.FORBIDDEN,
          isPublic: true,
        });
      }
    }
    let meals = await Meal.list({ ...req.query });
    res.json(meals);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete meal
 */
exports.remove = async (req, res, next) => {
  try {
    const { meal } = req.locals;

    const restaurantId = meal.restaurant;
    const restaurant = await Restaurant.get(restaurantId);

    if (!restaurant.owner.equals(req.user.id)) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      return next(error);
    }

    await meal.remove();
    res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
  
};
