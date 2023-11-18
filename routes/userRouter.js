const express = require("express");
const router = express.Router({});

const userController = require('../controllers/userController');

router.get('/all', userController.getAllUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/update/:uid', userController.updateUser);

module.exports = router;