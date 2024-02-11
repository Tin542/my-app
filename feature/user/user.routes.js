const express = require("express");
const router = express.Router({});

const userController = require("./user.controller");
const authenMiddleware = require("../auth/auth.middleware");

router.get("/get-all", userController.getAll);
router.get("/get-detail/:id", userController.getDetail);
router.post("/edit", authenMiddleware.isAdmin, userController.editUser);
router.delete(
  "/delete/:id",
  authenMiddleware.isAdmin,
  userController.deleteUser
);

module.exports = router;
