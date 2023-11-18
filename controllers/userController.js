const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function userController() {
  return {
    login: async (req, res) => {
      try {
        let data = req.body; // get data from body;
        // check valid data
        if (!data.username || !data.password) {
          return res
            .status(400)
            .json({ ok: false, msg: "Please enter username and passowrd" });
        }
        // check if user existed
        const user = await prisma.user.findUnique({
          where: { username: data.username },
        });
        if (!user) {
          return res
            .status(404)
            .json({ ok: false, msg: "Account is not existed" });
        }
        // check login
        const result = await prisma.user.findUnique({
          where: { username: data.username, password: data.password },
        });
        if (!result) {
          return res.status(200).json({ ok: true, msg: "Wrong password" });
        } else {
          return res
            .status(200)
            .json({ ok: true, msg: "login successfull", data: result });
        }
      } catch (error) {
        res.status(500).json({
          ok: false,
          error: "Something went wrong!",
        });
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    register: async (req, res) => {
      try {
        let data = req.body;
        // check data validation
        if (!data.username || !data.password || !data.full_name) {
          return res
            .status(400)
            .json({ ok: false, msg: "Please enter all requied fields." });
        }
        // check duplicate data
        const user = await prisma.user.findUnique({
          where: { username: data.username },
        });
        if (user) {
          return res
            .status(400)
            .json({ ok: false, msg: "Username already in use" });
        }
        const result = await prisma.user.create({
          data: {
            username: data.username,
            password: data.password,
            full_name: data.full_name,
            score: 0,
          },
        });
        return res.status(200).json({ ok: true, data: result });
      } catch (error) {
        res.status(500).json({
          ok: false,
          error: "Something went wrong!",
        });
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    getAllUser: async (req, res) => {
      try {
        const users = await prisma.user.findMany();
        if (users.length === 0) {
          return res
            .status(400)
            .json({ ok: false, message: "list users are empty" });
        }
        return res.json({ ok: true, data: users });
      } catch (error) {
        res.status(500).json({
          ok: false,
          error: "Something went wrong!",
        });
      } finally {
        async () => await prisma.$disconnect();
      }
    },
  };
}

module.exports = new userController();
