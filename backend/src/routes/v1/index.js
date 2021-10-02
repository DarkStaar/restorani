const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const restaurantRoutes = require('./restaurant.route');
const mealRoutes = require('./meal.route');
const orderRoutes = require('./order.route');

const router = express.Router();

router.use('/', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/meals', mealRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
