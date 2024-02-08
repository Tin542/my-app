const express = require("express");
const router = express.Router({});

const userController = require("./user.controller");

router.get("/get-all", userController.getAll);
router.get("/get-detail/:id", userController.getDetail);
router.post("/edit", userController.editUser);
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
