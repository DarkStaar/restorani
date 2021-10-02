const express = require("express");
const { validate } = require("express-validation");
const controller = require("../../controllers/meal.controller");
const { authorize } = require("../../middlewares/auth");
const { Role } = require("../../config/constants");
const router = express.Router();
const { createMeal, updateMeal } = require("../../validations/meal.validation");

router.param("mealId", controller.load);

router
  .route("/")
  .get(authorize(Role.User, Role.Owner), controller.list)
  .post(authorize(Role.Owner), validate(createMeal), controller.create);

router
  .route("/:mealId")
  .get(authorize(Role.User, Role.Owner), controller.get)
  .patch(authorize(Role.Owner), validate(updateMeal), controller.update)
  .delete(authorize(Role.Owner), controller.remove);

module.exports = router;
