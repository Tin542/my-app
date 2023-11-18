const { PrismaClient } = require("@prisma/client");

const resJSON = require("../constants/responseJSON");

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
            .json(resJSON(false, 400, "Please enter required fields", null));
        }
        // check if user existed
        const user = await prisma.user.findUnique({
          where: { username: data.username },
        });
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 404, "Account not found", null));
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
            .json(resJSON(true, 200, "Login success", result));
        }
      } catch (error) {
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
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
        const result = await prisma.user.create({
          data: {
            username: data.username,
            password: data.password,
            full_name: data.full_name,
            score: 0,
          },
        });
        return res
          .status(200)
          .json(resJSON(true, 200, "Register successfull", result));
      } catch (error) {
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    getAllUser: async (req, res) => {
      try {
        const users = await prisma.user.findMany();
        if (users.length === 0) {
          return res.status(200).json(resJSON(true, 200, "No Records", null));
        }
        return res.json(resJSON(true, 200, "User founded", users));
      } catch (error) {
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    updateUser: async (req, res) => {
      try {
        // check valid data
        let data = req.body; // get data from body
        let uid = parseInt(req.params.uid); // get user id from params
        if (!data.full_name) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Please enter require fields", null));
        }
        // check if user existd
        const user = await prisma.user.findUnique({ where: { user_id: uid } });
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 404, "User not found", null));
        }
        const result = await prisma.user.update({
          where: { user_id: uid },
          data: { full_name: data.full_name },
        });
        return res.json(resJSON(true, 200, "Update success", result));
      } catch (error) {
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
        console.log(error);
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    deleteUser: async (req, res) => {
      try {
        let uid = parseInt(req.params.uid); // get user id
        // check if user already exists
        const user = await prisma.user.findUnique({ where: { user_id: uid } });
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 404, "User not found", null));
        }
        const result = await prisma.user.delete({ where: { user_id: uid } });
        return res
          .status(200)
          .json(resJSON(true, 200, "Delete successfully", result));
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      }
    },
  };
}

module.exports = new userController();
