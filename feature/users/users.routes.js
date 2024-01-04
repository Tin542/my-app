const express = require("express");
const router = express.Router({});

const userController = require('./users.controller');
const verifyToken = require('../auth/auth.middleware');

router.get('/all', verifyToken, userController.getAllUser);
router.put('/update/:uid', userController.updateUser);
router.delete('/delete/:uid', userController.deleteUser);
router.put('/update-score/:uid', userController.updateScore);

module.exports = router;