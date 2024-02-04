const express = require("express");
const router = express.Router({});

const authMiddleware = require("../auth/auth.middleware");
const userController = require("./users/users.controller");

const isAdmin = authMiddleware.isAdmin;

// Management User
router.get('/user/all', isAdmin, userController.getAllUser);
router.put('/user/update/:uid', isAdmin, userController.updateUser);
router.delete('/user/delete/:uid',isAdmin, userController.deleteUser);
router.post('/user/create', isAdmin, userController.createUser);

module.exports = router;
