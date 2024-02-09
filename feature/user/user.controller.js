"use strict";
const ObjectID = require("mongodb").ObjectId;

const resJSON = require("../../constants/responseJSON");
const User = require("../../models/user.model").User;
const Order = require("../../models/order").Order;

function UserController() {
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
    getAll: async (req, res) => {
      try {
        let page = req.query.page;
        let email = req.query.email || "";
        let username = req.query.username || "";
        let status = req.query.status || "";
        if (!page || parseInt(page) <= 0) {
          page = 1;
        }
        let skip = (parseInt(page) - 1) * SELF.SIZE;

        let filter = {};
        if (email) {
          filter["email"] = new RegExp(email, "i");
        }
        if (username) {
          filter["username"] = new RegExp(username, "i");
        }
        if (status) {
          filter["active"] = /^true$/i.test(status);
        }
        filter["role"] = "customer";

        // pagination
        Promise.all([
          // 2 hàm bên trong sẽ thực thi đồng thời ==> giảm thời gian thực thi ==> improve performance
          User.countDocuments(filter).lean(), // Lấy tổng số product
          User.find(filter)
            .sort({ createdAt: -1 })
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
              let total = await Order.find({ userID: rs[1][i]._id }).lean();
              if (total) {
                rs[1][i]["orders"] = total.length;
              }
            }
            return res
              .status(200)
              .json(resJSON(true, 200, "User found", rs[1]));
          })
          .catch((error) => {
            console.log(error);
            res.send({ s: 400, msg: error });
          });
      } catch (error) {
        console.log(error);
      }
    },
    getDetail: async (req, res ) => {
      try {
        let userId = req.params?.id;
        let result = await User.findById(userId);
        if (!result) {
          return res
            .status(404)
            .json(resJSON(false, 404, "User not found", null));
        }
        return res
          .status(200)
          .json(resJSON(true, 200, "User found", result));
      } catch (error) {
        console.log("Get Detail error: " + error);
      }
    },
    editUser: async (req, res) => {
      try {
        let editData = req.body;
        let detailUser = await User.findById(editData._id);
        if (!detailUser) {
          return res
            .status(404)
            .json(resJSON(false, 404, "User not found", null));
        }
        delete editData._id; // xoa field id trong editData
        return await User.findByIdAndUpdate(detailUser._id, editData)
          .then((rs) => {
            if (rs) {
              return res
                .status(200)
                .json(resJSON(true, 200, "User edited", rs));
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log("edit user error: ", error);
      }
    },
    deleteUser: async (req, res) => {
      try {
        const uId = req.params?.id;
        const user = await User.findById(uId);
        if (!user) {
            return res
            .status(404)
            .json(resJSON(false, 404, "user not found", null));
        }
        User.deleteOne({ _id: uId })
          .then((rs) => {
            return res
            .status(200)
            .json(resJSON(true, 200, "user deleted", rs));
          })
          .catch((e) => {
            console.log(`deleteuser - fail: ${e}`);
            return rs.json({ s: 400, msg: "deleteuserfail" });
          });
      } catch (error) {
        console.log(error);
      }
    }
  };
}
module.exports = new UserController();
