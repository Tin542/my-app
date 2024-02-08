// const { PrismaClient } = require("");

// const authMethod = require("./auth.method");
// const resJSON = require("../../constants/responseJSON");
// const roleConstants = require("../../constants/app/role/roleId");

// const prisma = new PrismaClient();

// exports.isAdmin = async (req, res, next) => {
//   // Lấy access token từ header
//   if(!req.header('Authorization')){
//     return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
//   }
//   const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '');
//   if (!accessTokenFromHeader) {
//     return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
//   }

//   const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

//   const verified = await authMethod.verifyToken(
//     accessTokenFromHeader,
//     accessTokenSecret
//   );
//   if (!verified) {
//     return res
//       .status(401)
//       .json(resJSON(false, 401, "Access token is expried", null));
//   }

//   if (verified.payload.role !== roleConstants.ROLE_ADMIN) {
//     return res.status(403).json(resJSON(false, 403, "Access Deniend", null));
//   }

//   const user = await prisma.user.findUnique({
//     where: { user_id: verified.payload.uid },
//   });
//   req.user = user;

//   return next();
// };
// exports.isCustomer = async (req, res, next) => {
//   // Lấy access token từ header
//   if(!req.header('Authorization')){
//     return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
//   }
//   const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '');
//   if (!accessTokenFromHeader) {
//     return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
//   }

//   const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

//   const verified = await authMethod.verifyToken(
//     accessTokenFromHeader,
//     accessTokenSecret
//   );
//   if (!verified) {
//     return res
//       .status(401)
//       .json(resJSON(false, 401, "Access token is expried", null));
//   }

//   if (verified.payload.role !== roleConstants.ROLE_CUSTOMER) {
//     return res.status(403).json(resJSON(false, 403, "Access Deniend", null));
//   }

//   const user = await prisma.user.findUnique({
//     where: { user_id: verified.payload.uid },
//   });
//   req.user = user;

//   return next();
// };
