const express = require("express");
const router = express.Router({});

const roleController = require("./roles.controller");
const authMiddleware = require("../auth/auth.middleware");

const isAdmin = authMiddleware.isAdmin;

router.post("/create", isAdmin, roleController.add);
router.get("/all", isAdmin, roleController.getAll);
router.delete("/delete/:id", isAdmin, roleController.delete);
router.put("/update/:id", isAdmin, roleController.update);

module.exports = router;
