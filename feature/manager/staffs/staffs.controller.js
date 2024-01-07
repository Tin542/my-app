const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // encrypt password

const resJSON = require("../../../constants/responseJSON");
const enCryptPassword = require("../../../utils/encryptPassword");

const prisma = new PrismaClient();

function userController() {
  return {
    createStaff: async (req, res) => {
      try {
        let dataCreate = req.body;
        // check all required fields
        if (
          !dataCreate.fullName ||
          !dataCreate.username ||
          !dataCreate.password ||
          !dataCreate.isActived
        ) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Enter all required fields"));
        }
        // check is username is alredy in use
        const usernameExisted = await prisma.user.findUnique({
          where: { username: dataCreate.username },
        });
        if (usernameExisted) {
          return res
            .statsu(400)
            .json(resJSON(false, 400, "Username already in use", null));
        }
        // insert user
        enCryptPassword(dataCreate.password).then(async (hash) => {
          const result = await prisma.user.create({
            data: {
              username: dataCreate.username,
              password: hash,
              full_name: dataCreate.fullName,
              score: 0,
              isActived: dataCreate.isActived,
              isDeleted: false,
              create_date: new Date(),
              update_date: new Date(),
              role: {
                create: [
                  {
                    create_date: new Date(),
                    update_date: new Date(),
                    role: {
                      connect: {
                        role_id: 3,
                      },
                    },
                  },
                ],
              },
            },
          });
          return res
            .status(200)
            .json(resJSON(true, 200, "Create staff success", result));
        });
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    getAllStaff: async (req, res) => {
      try {
        const users = await prisma.user.findMany({
          where: {
            isDeleted: false,
            role: {
              some: {
                rid: 3,
              },
            },
          },
        });
        if (users.length === 0) {
          return res.status(200).json(resJSON(true, 200, "No Records", null));
        }
        return res.json(resJSON(true, 200, "Staff founded", users));
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    updateStaff: async (req, res) => {
      try {
        // check valid data
        let data = req.body; // get data from body
        let uid = parseInt(req.params.uid); // get user id from params
        if (!data.full_name || !data.username) {
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
        // check if username existed
        const usernameExisted = await prisma.user.findUnique({
          where: { username: data.username },
        });
        if (usernameExisted) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Username already exists", null));
        }
        const result = await prisma.user.update({
          where: { user_id: uid },
          data: {
            full_name: data.full_name,
            username: data.username,
            update_date: new Date(),
          },
        });
        return res.json(resJSON(true, 200, "Update success", result));
      } catch (error) {
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
        console.log(error);
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    deleteStaff: async (req, res) => {
      try {
        let uid = parseInt(req.params.uid); // get user id
        // check if user already exists
        const user = await prisma.user.findUnique({ where: { user_id: uid } });
        if (!user) {
          return res
            .status(404)
            .json(resJSON(false, 404, "User not found", null));
        }
        const deleteRef = await prisma.user_Role.deleteMany({
          where: { uid: uid },
        });
        if (!deleteRef) {
          return res
            .status(500)
            .json(resJSON(false, 500, "Something went wrong", null));
        }
        const result = await prisma.user.delete({ where: { user_id: uid } });
        return res
          .status(200)
          .json(resJSON(true, 200, "Delete successfully", result));
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
  };
}

module.exports = new userController();
