const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // encrypt password
const jwt = require("jsonwebtoken");

const resJSON = require("../../constants/responseJSON");

const prisma = new PrismaClient();

function authController() {
  const SELF = {
    enCodePass: (password) => {
      return bcrypt
        .hash(password, 10) // change encode password - 10 : salt
        .then((hash) => {
          return Promise.resolve(hash);
        })
        .catch((err) => {
          Logger.error(`encrypt password fail: ${err}`);
        });
    },
  };
  return {
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
            .status(401)
            .json(resJSON(false, 401, "Wrong password", null));
        } else {
          const token = jwt.sign(
            {
              uid: user.user_id,
              rid: user.role[0].rid,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: process.env.ACCESS_TOKEN_LIFE,
            }
          );
          user.access_token = token;
          res.header('auth-token', token).send(token);
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
    register: async (req, res) => {
      try {
        let data = req.body;
        let rid = req.body.rid;
        if (!rid) {
          rid = 2; // Defaul User role
        } else {
          const resultRole = await prisma.role.findUnique({
            where: { role_id: parseInt(rid) },
          });
          if (!resultRole) {
            return res
              .status(404)
              .json(resJSON(false, 404, "Role not found", null));
          }
        }
        // check data validation
        if (!data.username || !data.password || !data.full_name) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Please enter reuired fields", null));
        }
        // check duplicate data
        const user = await prisma.user.findUnique({
          where: { username: data.username },
        });
        if (user) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Username already in use", null));
        }
        SELF.enCodePass(data.password).then(async (hash) => {
          const result = await prisma.user.create({
            data: {
              username: data.username,
              password: hash,
              full_name: data.full_name,
              score: 0,
              create_date: new Date(),
              update_date: new Date(),
              role: {
                create: [
                  {
                    create_date: new Date(),
                    update_date: new Date(),
                    role: {
                      connect: {
                        role_id: parseInt(rid),
                      },
                    },
                  },
                ],
              },
            },
          });
          return res
            .status(200)
            .json(resJSON(true, 200, "Register successfull", result));
        });
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
  };
}
module.exports = new authController();
