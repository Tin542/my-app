const express = require("express");
const router = express.Router({});

const authMiddleware = require("../auth/auth.middleware");
const roleController = require("./roles/roles.controller");
const userController = require("./users/users.controller");

const isAdmin = authMiddleware.isAdmin;

// Management Role
router.post("/role/create", isAdmin, roleController.add);
router.get("/role/all", isAdmin, roleController.getAll);
router.delete("/role/delete/:id", isAdmin, roleController.delete);
router.put("/role/update/:id", isAdmin, roleController.update);

// Management User
router.get('/user/all', isAdmin, userController.getAllUser);
router.put('/user/update/:uid', isAdmin, userController.updateUser);
router.delete('/user/delete/:uid',isAdmin, userController.deleteUser);
router.post('/user/create', isAdmin, userController.createUser);

module.exports = router;
