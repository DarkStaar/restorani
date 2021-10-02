const httpStatus = require('http-status');
const Restaurant = require('../models/restaurant.model');
const Order = require('../models/order.model');
const Meal = require('../models/meal.model');
const APIError = require('../config/APIError');
const { OrderStatus, Role } = require('../config/constants');

/**
 * Load order from orderId and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const order = await Order.get(id);
    req.locals = { order };
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get order
 */
exports.get = (req, res) => res.json(req.locals.order.toJSON());


/**
 * Create new order
 */
exports.create = async (req, res, next) => {
  try {
    const { restaurantId } = req.body;
    if (req.user.role !== Role.User) {
      const error = new APIError({
        message: "You don't have permission.",
        status: httpStatus.FORBIDDEN
      });
      throw error;
    }
    const restaurant = await Restaurant.get(restaurantId);
    const orderData = req.body;
    if (!orderData.meals || orderData.meals.count === 0) {
      const error = new APIError({
        message: "Order must have meals.",
        status: httpStatus.NOT_ACCEPTABLE
      });
      throw error;
    }
    let total = 0;
    let orderMeals = [];
    for (let mealData of orderData.meals) {
      const meal = await Meal.findById(mealData.id);
      if (!meal) {
        const error = new APIError({
          message: `Meal with id '${mealData.id}' doesn't exist.`,
          status: httpStatus.NOT_ACCEPTABLE
        });
        throw error;
      } else if (!meal.restaurant.equals(restaurant._id)) {
        const error = new APIError({
          message: `Meal with id '${mealData.id}' doesn't belong to the restaurant`,
          status: httpStatus.NOT_ACCEPTABLE
        });
        throw error;
      }
      let count = parseInt(mealData.count);
      if (count < 1)
        count = 1;
      orderMeals.push({
        id: meal._id,
        name: meal.name,
        price: meal.price,
        count: count
      });
      total += meal.price * count;
    }

    const order = new Order({ meals: orderMeals, total });
    order.user = req.user;
    order.restaurant = restaurant;
    order.status = OrderStatus.Placed;
    order.track = [{ status: OrderStatus.Placed, time: new Date() }];

    const savedOrder = await order.save();
    res.status(httpStatus.CREATED);
    res.json(savedOrder.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * Update Status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { user } = req;
    const order = req.locals.order;

    const restaurant = order.restaurant;
    
    if (user.role === Role.User && (
        !order.user._id.equals(user._id) || 
        (status != OrderStatus.Canceled && status != OrderStatus.Received)
      )
    ) {
      throw new APIError({
        message: "You don't have permission to set this status.",
        status: httpStatus.FORBIDDEN
      });
    }
    if (user.role === Role.Owner && (
        !user._id.equals(restaurant.owner) ||
        (status == OrderStatus.Canceled || status == OrderStatus.Received)
      )
    ) {
      throw new APIError({
        message: "You don't have permission to set this status.",
        status: httpStatus.FORBIDDEN
      });
    }

    const statusTransitionMap = {
      [Role.User]: {
        [OrderStatus.Placed]: [OrderStatus.Canceled],
        [OrderStatus.Processing]: [],
        [OrderStatus.InRoute]: [],
        [OrderStatus.Delivered]: [OrderStatus.Received],
        [OrderStatus.Received]: [],
        [OrderStatus.Canceled]: [],
      },
      [Role.Owner]: {
        [OrderStatus.Placed]: [OrderStatus.Processing],
        [OrderStatus.Processing]: [OrderStatus.InRoute],
        [OrderStatus.InRoute]: [OrderStatus.Delivered],
        [OrderStatus.Delivered]: [],
        [OrderStatus.Received]: [],
        [OrderStatus.Canceled]: [],
      }
    }


    if (!statusTransitionMap[user.role][order.status].includes(status)) {
      throw new APIError({
        message: "Invalid status for this order.",
        status: httpStatus.NOT_ACCEPTABLE
      });
    }

    order.status = status;
    order.track.push({ status: status, time: new Date() });
    const savedOrder = await order.save();
    res.status(httpStatus.CREATED);
    res.json(savedOrder.toJSON());
  } catch (error) {
    next(error);
  }
};


/**
 * Update existing order
 */
exports.update = (req, res, next) => {
  const orderData = req.body;
  delete orderData['status'];
  const order = Object.assign(req.locals.order, orderData);

  order.save()
    .then(savedOrder => res.json(savedOrder.toJSON()))
    .catch(e => next(e));
};

/**
 * Get order list
 */
exports.list = async (req, res, next) => {
  try {
    const { user } = req;
    if (user.role === Role.User) {
      let orders = await Order.list({ ...req.query, userId: user._id });
      res.json(orders);
    } else if (user.role === Role.Owner) {
      let restaurants = await Restaurant.list({ perPage: -1, ownerId: user._id });
      let orders = await Order.list({ ...req.query, restaurants: restaurants.restaurants.map(r => r.id) });
      res.json(orders);
    }

  } catch (error) {
    next(error);
  }
};


/**
 * Delete order
 */
exports.remove = (req, res, next) => {
  const { order } = req.locals;
  if (!order.user.equals(req.user.id)) {
    const error = new APIError({
      message: "You don't have permission.",
      status: httpStatus.FORBIDDEN
    });
    return next(error);
  }
  order.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
