const { PrismaClient } = require("@prisma/client");

const resJSON = require("../../constants/responseJSON");

const prisma = new PrismaClient();

function roleController() {
  return {
    add: async (req, res) => {
      try {
        let data = req.body;
        // check valid body
        if (!data.name || !data.id) {
          return res
            .status(400)
            .json(resJSON(false, 400, "Please enter required field", null));
        }
        const result = await prisma.role.create({
          data: {
            role_id: parseInt(data.id),
            role_name: data.name,
            create_date: new Date(),
            update_date: new Date(),
          },
        });
        return res
          .status(200)
          .json(
            resJSON(true, 200, `role ${data.name} created successfully`, result)
          );
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    getAll: async (req, res) => {
      try {
        const result = await prisma.role.findMany();
        return res.status(200).json(resJSON(true, 200, "Role founded successfully", result));
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
    delete: async (req, res) => {
      try {
        // get id from param
        let rid = req.params.id;
        if(!rid){
          return res.status(400).json(resJSON(false, 400, "Please enter role id", null))
        }
        const role = await prisma.role.findUnique({ where: { role_id: parseInt(rid) } });
        if (!role) {
          return res
            .status(404)
            .json(resJSON(false, 404, "Role not found", null));
        }
        const result = await prisma.role.delete({ where: { role_id: parseInt(rid) } });
        if(result){
          return res.status(200).json(resJSON(false, 200, "Delete success", null))
        }
      } catch (error) {
        console.log(error);
        res.status(500).json(resJSON(false, 500, "Something went wrong", null));
      } finally {
        async () => await prisma.$disconnect();
      }
    },
  };
}
module.exports = new roleController();
