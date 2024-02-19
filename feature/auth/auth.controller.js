const bcrypt = require("bcrypt"); // encrypt password
const randToken = require("rand-token");

const resJSON = require("../../constants/responseJSON");
const enCryptPassword = require("../../utils/encryptPassword");
const authMethod = require("./auth.method");
const User = require("../../models/user.model").User;

function authController() {
  return {
    refreshToken: async (req, res) => {
      try {
        // Lấy access token từ header
        const accessToken = req.header("Authorization").replace("Bearer ", "");
        if (!accessToken) {
          return res
            .status(404)
            .json(resJSON(false, 404, "accessToken not found", null));
        }
        // Lấy refresh token từ body
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
          return res
            .status(404)
            .json(resJSON(false, 404, "refreshToken not found", null));
        }
        // Decode access token đó
        const decoded = await authMethod.decodeToken(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        if (!decoded) {
          return res
            .status(400)
            .json(resJSON(false, 400, "refreshToken invalid (decode)", null));
        }
        // get data from old access token
        const uid = decoded.payload.uid;
        const role = decoded.payload.role;
        // check User of token
        const user = await User.findOne({
          _id: uid,
        }).lean();
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 400, "user not found", null));
        }
        if (refreshToken != user.refresh_token) {
          return res
            .status(403)
            .json(resJSON(false, 403, "refreshToken invalid", null));
        }
        // Tạo access token mới
        const dataForAccessToken = {
          ui: uid,
          role: role,
        };
        const accessTokenNew = await authMethod.generateToken(
          dataForAccessToken,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_LIFE
        );
        if (!accessTokenNew) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Fail to create new access token", null));
        }
        return res.json(
          resJSON(true, 200, "Create new access token success", accessTokenNew)
        );
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      }
    },
    login: async (req, res) => {
      try {
        let data = req.body; // get data from body;
        // check valid data
        if (!data.username || !data.password) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Please enter required fields", null));
        }
        // check if user existed
        const user = await User.findOne({
          username: data?.username.trim(),
        }).lean();
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 404, "Account not found", null));
        }
        // check login
        const result = await bcrypt.compare(data?.password.trim(), user.password);
        if (!result) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Wrong password", null));
        } else {
          // create access token
          const dataForAccessToken = {
            uid: user._id, // store user id to access token
            role: user.role, // store user role to access token
          };
          const accessToken = await authMethod.generateToken(
            dataForAccessToken,
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_LIFE
          );
          if (!accessToken) {
            return res
              .status(401)
              .json(resJSON(false, 401, "Login failed", null));
          } else {
            user.access_token = accessToken;
          }
          // create refresh token
          let refreshToken = randToken.generate(21); // tạo 1 refresh token ngẫu nhiên
          if (!user.refresh_token) {
            // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
            await User.findByIdAndUpdate(user._id, {
              refresh_token: refreshToken,
            });
            user.refresh_token = refreshToken;
          } else {
            // Nếu user này đã có refresh token thì lấy refresh token đó từ database
            refreshToken = user.refresh_token;
          }
          return res
            .status(200)
            .json(resJSON(true, 200, "Login success", user));
        }
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      }
    },
    register: async (req, res) => {
      try {
        let data = req.body; // data register
        // check validate
        if (
          !data?.fullname ||
          !data?.username ||
          !data?.email ||
          !data?.password
        ) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Please enter required fields", null));
        }
        // check if user is already registered
        const userInfo = await User.findOne({
          $or: [{ email: data?.email }, { username: data?.username }], // find user by email or username
        }).lean(); // lean() => tăng hiệu suất truy vấn
        if (userInfo) {
          return res
            .status(400)
            .json(
              resJSON(false, 400, "Email or username is already existed", null)
            );
        }
        // register user
        return enCryptPassword(data?.password).then(async (hash) => {
          try {
            const rs = await User.create({
              fullname: data?.fullname,
              username: data?.username,
              password: hash,
              email: data?.email,
              active: true,
              role: "customer",
            });
            return res
              .status(200)
              .json(resJSON(true, 200, "Register success", rs));
          } catch (err) {
            console.log("register user error: ", err);
          }
        });
      } catch (error) {
        console.log("register error: ", error);
      }
    },
  };
}
module.exports = new authController();
