"use strict";
const moment = require("moment");

const ObjectID = require("mongodb").ObjectId;

const Product = require("../models/product").Product;
const User = require("../models/user").User;
const OrderDetail = require("../models/orderDetail").OrderDetail;
const Comment = require("../models/comment").Comment;
const Category = require("../models/category").category;
const Order = require("../models/order").Order;

function HomeController() {
  // chua global var
  const SELF = {
    SIZE: 8,
    detailProductGB: {},
    listSuggestGB: [],
    listCommentsGB: [],
    calRate: (listCmt, count) => {
      let rate = 0;
      let totalStar = 0;
      for (let i = 0; i < listCmt.length; i++) {
        totalStar = totalStar + listCmt[i].rate;
      }
      if (totalStar % count !== 0) {
        // nếu tổng số star cmt chia count có dư
        rate = Math.floor(totalStar / count) + 1; // làm tròn số xuống cận dưới rồi + 1
      } else {
        rate = totalStar / count; // nếu ko dư thì chia bth
      }
      return rate;
    },
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
    getPopularProduct: async () => {
      try {
        let listOrder = await Order.find({ status: "success", isPaid: true });
        let listTmp = [];
        for (let i = 0; i < listOrder.length; i++) {
          let orderDetails = await OrderDetail.find({
            orderID: new ObjectID(listOrder[i]._id),
          });
          if (orderDetails.length > 0) {
            listTmp = listTmp.concat(orderDetails);
          }
        }
        // Đếm số lần xuất hiện
        let arrayResult = [];
        for (let i = 0; i < listTmp.length; i++) {
          let idx = arrayResult.findIndex(
            (el) => el.pid === listTmp[i].productID
          );
          if (idx > -1) {
            arrayResult[idx]["count"] += 1;
          } else {
            arrayResult.push({
              pid: listTmp[i].productID,
              count: 1,
            });
          }
        }
        arrayResult.sort((a, b) => b.count - a.count); // sort list theo thứ tự giảm dần count
        return arrayResult.slice(0, 8); // lấy 10 pid đầu tiên
      } catch (error) {
        console.log("error: " + error);
      }
    },
    getPopularCategories: async () => {
      try {
        let listCateId = []; // list category id
        let arrResult = []; // list result
        let listOrder = await Order.find({ status: "success", isPaid: true });
        let listTmp = [];
        for (let i = 0; i < listOrder.length; i++) {
          let orderDetails = await OrderDetail.find({
            orderID: new ObjectID(listOrder[i]._id),
          });
          if (orderDetails.length > 0) {
            listTmp = listTmp.concat(orderDetails);
          }
        }
        // lấy list category id dựa trên productID trong orderDetail
        for (let i = 0; i < listTmp.length; i++) {
          let pDetail = await Product.findById(listTmp[i].productID);
          listCateId.push(pDetail.categoryId);
        }
        // đếm số lần category xuất hiện
        for (let i = 0; i < listCateId.length; i++) {
          let idx = arrResult.findIndex((el) => el.cid === listCateId[i]);
          if (idx > -1) {
            arrResult[idx]["count"] += 1;
          } else {
            arrResult.push({
              cid: listCateId[i],
              count: 1,
            });
          }
        }
        arrResult.sort((a, b) => b.count - a.count); // sort list theo thứ tự giảm dần count
        return arrResult.slice(0, 8); // lấy 3 cid đầu tiên
      } catch (error) {
        console.log("error: " + error);
      }
    },
  };
  return {
    home: async (req, res) => {
      try {
        // Top Product
        let listPid = await SELF.getPopularProduct();
        let listProduct = [];
        for (let i = 0; i < listPid.length; i++) {
          let product = await Product.findById(listPid[i].pid);
          listProduct.push(product);
        }
        // Top Category
        let listCid = await SELF.getPopularCategories();
        let listCategories = [];
        for (let i = 0; i < listCid.length; i++) {
          let category = await Category.findById(listCid[i].cid);
          listCategories.push(category);
        }
        return res.status(200).json(
          resJSON(true, 200, "load home success", {
            listItems: listProduct,
            topCategories: listCategories,
          })
        );
      } catch (error) {
        console.log("error at home controller", error);
      }
    },
    getProductDetail: async (req, res) => {
      try {
        let productId = req.params?.id;
        let result = await Product.findById(productId);
        let listSuggestItem = await Product.find({
          categoryId: result.categoryId,
          _id: { $ne: productId },
        }).limit(4); // get 4 suggestions
        let listComment = await Comment.find({ productID: productId }).sort({
          createdAt: -1,
        }); // get all comments
        if (!result) {
          return res.json({ s: 404, msg: "Product not found" });
        }
        if (!listSuggestItem) {
          return res.json({ s: 404, msg: "Get list suggest fail" });
        }
        SELF.detailProductGB = result;
        SELF.listSuggestGB = listSuggestItem;
        SELF.listCommentsGB = listComment;
        return res.status(200).json(
          resJSON(true, 200, "load detail success", {
            detail: result,
            listItems: listSuggestItem,
            comments: listComment,
          })
        );
      } catch (error) {
        console.error("get detail at homeControlelr error: " + error);
      }
    },
    getList: async (req, res) => {
      try {
        // let {page, searchValue, category, star} = req.query
        let page = req.query.page;
        let keySearch = req.query.searchValue || "";
        let categorySearch = req.query.category || "";
        let priceRange = req.query.priceRange || "";
        let rateStar = req.query.star || "";
        let sortValue = req.query.sortValue || -1;
        let size = req.query.size || 12;

        //paging
        if (!page || parseInt(page) <= 0) {
          page = 1;
        }
        let skip = (parseInt(page) - 1) * parseInt(size);
        //filter
        let filter = {};
        // filter by name
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
        // filter by price
        if (priceRange) {
          let maxPrice = priceRange.split("-")[1];
          let minPrice = priceRange.split("-")[0];
          filter["price"] = {
            $gte: parseInt(minPrice),
            $lte: parseInt(maxPrice),
          };
        }
        //get all categories
        let categoryList = await SELF.getAllCategories();
        // pagination
        Promise.all([
          // 2 hàm bên trong sẽ thực thi đồng thời ==> giảm thời gian thực thi ==> improve performance
          Product.countDocuments(filter).lean(), // Lấy tổng số product
          Product.find(filter)
            .sort({ price: parseInt(sortValue) })
            .skip(skip) // số trang bỏ qua ==> skip = (số trang hiện tại - 1) * số item ở mỗi trang
            .limit(parseInt(size))
            .lean(), // số item ở mỗi trang
        ])
          .then(async (rs) => {
            // rs trả ra 1 array [kết quả của function 1, kết quả của function 2, ..]
            let productCount = rs[0]; // tổng số product
            let pageCount = 0; // tổng số trang
            if (productCount % parseInt(size) !== 0) {
              // nếu tổng số product chia SIZE có dư
              pageCount = Math.floor(productCount / parseInt(size)) + 1; // làm tròn số xuống cận dưới rồi + 1
            } else {
              pageCount = productCount / parseInt(size); // nếu ko dư thì chia bth
            }
            res.render("pages/products.ejs", {
              listItems: rs[1],
              pages: pageCount, // tổng số trang
              listCategories: categoryList,
              searchText: keySearch || "",
              filters: {
                category: categorySearch,
                star: rateStar,
                prices: priceRange,
              },
              sort: sortValue.toString(),
              size: size.toString(),
            });
          })
          .catch((error) => {
            res.send({ s: 400, msg: error });
          });
      } catch (error) {
        console.log(error);
      }
    },
    createComment: async (req, res) => {
      try {
        let commentData = req.body;

        let uid = res.locals.user; // get current user id;
        let currentUser = await User.findById(uid);

        commentData.userID = uid;
        commentData.username = currentUser.username;
        commentData.createDate = SELF.formatDateToString(new Date());

        // Check if user already buy this item
        const checkBuyAlready = await OrderDetail.findOne({
          $and: [{ productID: commentData?.productID }, { userID: uid }],
        }).lean();

        if (checkBuyAlready) {
          Comment.create(commentData)
            .then(async (rs) => {
              if (rs) {
                let commentCount = await Comment.find({
                  productID: commentData?.productID,
                });
                let rateUpdate = SELF.calRate(
                  commentCount,
                  commentCount.length
                );
                await Product.findByIdAndUpdate(commentData?.productID, {
                  rate: rateUpdate,
                });
                return res.redirect(
                  `/products/detail/${commentData?.productID}`
                );
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          return res.render("pages/detail", {
            data: SELF.detailProductGB,
            listItems: SELF.listSuggestGB,
            comments: SELF.listCommentsGB,
            msg: "Bạn không thể đánh giá sản phẩm khi chưa mua !!",
          });
        }
      } catch (error) {
        console.log("error at create comment", error);
      }
    },
  };
}

module.exports = new HomeController();
