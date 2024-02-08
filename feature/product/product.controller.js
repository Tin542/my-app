"use strict";
const ObjectID = require("mongodb").ObjectId;

const resJSON = require("../../constants/responseJSON");
const Product = require("./product.model").Product;
const Category = require("../../models/category").category;

function ProductController() {
  const SELF = {
    SIZE: 10,
    formatDateToString: (date) => {
      return moment(date).format("DD/MM/YYYY, h:mm:ss a");
    },
    getAllCategories: () => {
      return Category.find()
        .then()
        .catch((error) => {
          console.error(error);
        });
    },
  };
  return {
    getAllProduct: async (req, res) => {
      try {
        let page = req.query.page;
        let keySearch = req.query.pName || "";
        let rateStar = req.query.star || "";
        let categorySearch = req.query.category || "";
        let filter = {};
        if (keySearch) {
          filter["name"] = new RegExp(keySearch, "i");
        }
        // filter by category
        if (categorySearch) {
          filter["categoryId"] = categorySearch;
        }
        // filter by rate
        if (rateStar) {
          filter["rate"] = parseInt(rateStar);
        }
        if (!page || parseInt(page) <= 0) {
          page = 1;
        }
        let skip = (parseInt(page) - 1) * SELF.SIZE;
        // pagination
        Promise.all([
          // 2 hàm bên trong sẽ thực thi đồng thời ==> giảm thời gian thực thi ==> improve performance
          Product.countDocuments(filter).lean(), // Lấy tổng số product
          Product.find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip) // số trang bỏ qua ==> skip = (số trang hiện tại - 1) * số item ở mỗi trang
            .limit(SELF.SIZE)
            .lean(), // số item ở mỗi trang
        ])
          .then(async (rs) => {
            // rs trả ra 1 array [kết quả của function 1, kết quả của function 2, ..]
            let productCount = rs[0]; // tổng số product
            let pageCount = 0; // tổng số trang
            if (productCount % SELF.SIZE !== 0) {
              // nếu tổng số product chia SIZE có dư
              pageCount = Math.floor(productCount / SELF.SIZE) + 1; // làm tròn số xuống cận dưới rồi + 1
            } else {
              pageCount = productCount / SELF.SIZE; // nếu ko dư thì chia bth
            }
            for (let i = 0; i < rs[1].length; i++) {
              let catInfo = await Category.findById(rs[1][i].categoryId).lean();
              rs[1][i]["catName"] = catInfo.name;
            }

            return res
              .status(200)
              .json(resJSON(true, 200, "Product found", rs[1]));
          })
          .catch((error) => {
            console.log("error: " + error);
          });
      } catch (error) {
        console.log(error);
      }
    },
    getProductDetail: async (req, res) => {
      try {
        let productId = req.params?.id;
        let result = await Product.findById(productId);
        if (!result) {
          return res
            .status(404)
            .json(resJSON(false, 404, "Product not found", null));
        }
        return res
          .status(200)
          .json(resJSON(true, 200, "Product found", result));
      } catch (error) {
        console.log("Get Detail error: " + error);
      }
    },
    addProduct: (req, res) => {
      try {
        let data = req.body;
        data.rate = 0;
        return Product.create(data)
          .then((rs) => {
            return res
              .status(200)
              .json(resJSON(true, 200, "Product created", rs));
          })
          .catch((err) => {
            return res
              .status(400)
              .json(resJSON(false, 400, "Product created failed", err));
          });
      } catch (error) {
        console.log(error);
      }
    },
    editProduct: async (req, res) => {
      try {
        let editData = req.body;
        let detailProduct = await Product.findById(editData._id);
        if (!detailProduct) {
          return res
            .status(404)
            .json(resJSON(false, 404, "Product not found", null));
        }
        delete editData._id; // xoa field id trong editData
        return Product.findByIdAndUpdate(detailProduct._id, editData)
          .then((rs) => {
            if (rs) {
              return res
                .status(200)
                .json(resJSON(true, 200, "Product edited", rs));
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log("edit product error: ", error);
      }
    },
    deleteProduct: async (req, res) => {
      try {
        const pId = req.params?.id;
        const product = await Product.findById(pId);
        if (!product) {
            return res
            .status(404)
            .json(resJSON(false, 404, "Product not found", null));
        }
        Product.deleteOne({ _id: pId })
          .then((rs) => {
            return res
            .status(200)
            .json(resJSON(true, 200, "Product deleted", rs));
          })
          .catch((e) => {
            console.log(`deleteProduct - fail: ${e}`);
            return rs.json({ s: 400, msg: "deleteProduct fail" });
          });
      } catch (error) {
        console.log(error);
      }
    },
  };
}
module.exports = new ProductController();
