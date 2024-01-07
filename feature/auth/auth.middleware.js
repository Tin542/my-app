const { PrismaClient } = require("@prisma/client");

const authMethod = require("./auth.method");
const resJSON = require("../../constants/responseJSON");
const roleConstants = require("../../constants/app/role/roleId");

const prisma = new PrismaClient();

exports.isAdmin = async (req, res, next) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.header('Authorization').replace('Bearer ', '');
  if (!accessTokenFromHeader) {
    return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!verified) {
    return res
      .status(401)
      .json(resJSON(false, 401, "Access Token is not verified", null));
  }

  if (verified.payload.rid !== roleConstants.ROLE_ADMIN) {
    return res.status(403).json(resJSON(false, 403, "Access Deniend", null));
  }

  const user = await prisma.user.findUnique({
    where: { user_id: verified.payload.uid },
  });
  req.user = user;

  return next();
};
exports.isManager = async (req, res, next) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_token;
  if (!accessTokenFromHeader) {
    return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!verified) {
    return res
      .status(401)
      .json(resJSON(false, 401, "Access Token is not verified", null));
  }

  if (verified.payload.rid !== roleConstants.ROLE_MANAGER) {
    return res.status(403).json(resJSON(false, 403, "Access Deniend", null));
  }

  const user = await prisma.user.findUnique({
    where: { user_id: verified.payload.uid },
  });
  req.user = user;

  return next();
};
exports.isStaff = async (req, res, next) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_token;
  if (!accessTokenFromHeader) {
    return res.status(401).json(resJSON(false, 401, "Unauthorized", null));
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!verified) {
    return res
      .status(401)
      .json(resJSON(false, 401, "Access Token is not verified", null));
  }

  if (verified.payload.rid !== roleConstants.ROLE_STAFF) {
    return res.status(403).json(resJSON(false, 403, "Access Deniend", null));
  }

  const user = await prisma.user.findUnique({
    where: { user_id: verified.payload.uid },
  });
  req.user = user;

  return next();
};
