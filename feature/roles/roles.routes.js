const express = require("express");
const router = express.Router({});

const roleController = require('./roles.controller');

router.post('/create', roleController.add);
router.get('/all', roleController.getAll);
router.delete('/delete/:id', roleController.delete);

module.exports = router;