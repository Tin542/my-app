const express = require("express");
const router = express.Router({});

const authMiddleware = require("../auth/auth.middleware");
const staffController = require("./staffs/staffs.controller");

const isManager = authMiddleware.isManager;

// Management User
router.get('/staff/all', isManager, staffController.getAllStaff);
// router.put('/staff/update/:uid', isManager, staffController.updateStaff);
// router.delete('/staff/delete/:uid',isManager, staffController.deleteStaff);
router.post('/staff/create', isManager, staffController.createStaff);

module.exports = router;
