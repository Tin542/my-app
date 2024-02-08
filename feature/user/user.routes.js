const express = require("express");
const router = express.Router({});

const userController = require("./user.controller");

router.get("/get-all", userController.getAll);

module.exports = router;
