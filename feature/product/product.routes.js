const express = require("express");
const router = express.Router({});

const productController = require("./product.controller");
const authenMiddleware = require("../auth/auth.middleware");

router.get("/get-all", productController.getAllProduct);
router.get("/get-detail/:id", productController.getProductDetail);
router.post("/create", authenMiddleware.isAdmin, productController.addProduct);
router.post("/edit", authenMiddleware.isAdmin, productController.editProduct);
router.delete(
  "/delete/:id",
  authenMiddleware.isAdmin,
  productController.deleteProduct
);

module.exports = router;
