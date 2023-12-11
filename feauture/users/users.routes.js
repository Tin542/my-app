const express = require("express");
const router = express.Router({});

const userController = require('./users.controller');

router.get('/all', userController.getAllUser);
router.put('/update/:uid', userController.updateUser);
router.delete('/delete/:uid', userController.deleteUser);
router.put('/update-score/:uid', userController.updateScore);

module.exports = router;