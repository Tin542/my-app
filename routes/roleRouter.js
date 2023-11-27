const express = require("express");
const router = express.Router({});

const roleController = require('../controllers/roleController');

router.post('/create', roleController.add);

module.exports = router;