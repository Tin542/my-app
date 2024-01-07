const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // encrypt password
const randToken = require("rand-token");

const resJSON = require("../../constants/responseJSON");
const authMethod = require("./auth.method");

const prisma = new PrismaClient();

function authController() {
  return {
    refreshToken: async (req, res) => {
      try {
        // Lấy access token từ header
        const accessToken = req.headers.x_token;
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
        const decoded = await authMethod.decodeToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
          return res
            .status(400)
            .json(resJSON(false, 400, "refreshToken invalid (decode)", null));
        }
        // get data from old access token
        const uid = decoded.payload.uid;
        const rid = decoded.payload.rid;
        // check User of token
        const user = await prisma.user.findUnique({ where: { user_id: parseInt(uid) } });
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 400, "user not found", null));
        }
        if (refreshToken != user.refresh_token) {
          return res
            .status(400)
            .json(resJSON(false, 400, "refreshToken invalid", null));
        }
        // Tạo access token mới
        const dataForAccessToken = {
          ui: uid,
          rid: rid,
        };
        const accessTokenNew = await authMethod.generateToken(
          dataForAccessToken,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_LIFE
        );
        if (!accessTokenNew) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Tạo access token không thành công", null));
        }
        return res.json(resJSON(true, 200, "Tạo access token thành công", accessTokenNew));
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
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
        const user = await prisma.user.findUnique({
          include: { role: true },
          where: {
            username: data.username,
          },
        });
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 404, "Account not found", null));
        }
        // check login
        const result = bcrypt.compare(data?.password.trim(), user.password);
        if (!result) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Wrong password", null));
        } else {
          // create access token
          const dataForAccessToken = {
            uid: user.user_id,
            rid: user.role[0].rid,
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
            await prisma.user.update({
              where: { user_id: parseInt(user.user_id) },
              data: {
                refresh_token: refreshToken,
                update_date: new Date(),
              },
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
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    // register: async (req, res) => {
    //   try {
    //     let data = req.body;
    //     let rid = req.body.rid;
    //     if (!rid) {
    //       rid = 2; // Defaul User role
    //     } else {
    //       const resultRole = await prisma.role.findUnique({
    //         where: { role_id: parseInt(rid) },
    //       });
    //       if (!resultRole) {
    //         return res
    //           .status(404)
    //           .json(resJSON(false, 404, "Role not found", null));
    //       }
    //     }
    //     // check data validation
    //     if (!data.username || !data.password || !data.full_name) {
    //       return res
    //         .status(400)
    //         .json(resJSON(false, 400, "Please enter reuired fields", null));
    //     }
    //     // check duplicate data
    //     const user = await prisma.user.findUnique({
    //       where: { username: data.username },
    //     });
    //     if (user) {
    //       return res
    //         .status(400)
    //         .json(resJSON(false, 400, "Username already in use", null));
    //     }
    //     SELF.enCodePass(data.password).then(async (hash) => {
    //       const result = await prisma.user.create({
    //         data: {
    //           username: data.username,
    //           password: hash,
    //           full_name: data.full_name,
    //           score: 0,
    //           create_date: new Date(),
    //           update_date: new Date(),
    //           role: {
    //             create: [
    //               {
    //                 create_date: new Date(),
    //                 update_date: new Date(),
    //                 role: {
    //                   connect: {
    //                     role_id: parseInt(rid),
    //                   },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       });
    //       return res
    //         .status(200)
    //         .json(resJSON(true, 200, "Register successfull", result));
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     res.status(500).json(resJSON(false, 500, "Something went wrong", null));
    //   } finally {
    //     async () => await prisma.$disconnect();
    //   }
    // },
  };
}
module.exports = new authController();
