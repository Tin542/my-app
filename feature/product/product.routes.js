const express = require("express");
const router = express.Router({});

const productController = require("./product.controller");
const authenMiddleware = require("../auth/auth.middleware");

router.get("/", productController.getAllProduct);
router.get("/get-detail/:id", productController.getProductDetail);
router.post("/create", productController.addProduct);
router.post("/edit", productController.editProduct);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
