const express = require("express");
const { validate } = require("express-validation");
const controller = require("../../controllers/restaurant.controller");
const userController = require("../../controllers/user.controller");
const { authorize } = require("../../middlewares/auth");
const { Role } = require("../../config/constants");
const router = express.Router();
const {
  createRestaurant,
  updateRestaurant,
} = require("../../validations/restaurant.validation");

router.param("restaurantId", controller.load);

router
  .route("/")
  .get(authorize(Role.User), controller.list)
  .post(authorize(Role.Owner), validate(createRestaurant), controller.create);

router.route("/owned").get(authorize(Role.Owner), controller.listOwned);
router
  .route("/:restaurantId")
  .get(authorize(Role.User, Role.Owner), controller.get)
  .patch(authorize(Role.Owner), validate(updateRestaurant), controller.update)
  .delete(authorize(Role.Owner), controller.remove);

router
  .route("/:restaurantId/users")
  .get(authorize(Role.Owner), userController.listForRestaurant);

router
  .route("/:restaurantId/block")
  .patch(authorize(Role.Owner), userController.blockUserForRestaurant);

router
  .route("/:restaurantId/unblock")
  .patch(authorize(Role.Owner), userController.unblockUserForRestaurant);

module.exports = router;
