const express = require("express");
const { validate } = require("express-validation");
const controller = require("../../controllers/order.controller");
const { authorize } = require("../../middlewares/auth");
const { Role } = require("../../config/constants");
const router = express.Router();
const { createOrder } = require("../../validations/order.validation");

router.param("orderId", controller.load);

router
  .route("/")
  .get(authorize(Role.User, Role.Owner), controller.list)
  .post(authorize(Role.User), validate(createOrder), controller.create);

router
  .route("/:orderId")
  .get(authorize(Role.User, Role.Owner), controller.get)
  .patch(authorize(Role.User, Role.Owner), controller.update)
  .delete(authorize(Role.User, Role.Owner), controller.remove);

router.route("/:orderId/status").patch(authorize(), controller.updateStatus);

module.exports = router;
