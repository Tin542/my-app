const { PrismaClient } = require("@prisma/client");

const authMethod = require("./auth.method");
const resJSON = require("../../constants/responseJSON");

const prisma = new PrismaClient();

exports.isAdmin = async (req, res, next) => {
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
    return res.status(401).send("Access token not verified");
  }

  if (verified.payload.rid !== 1) {
    return res.status(403).send("Access Deniend");
  }

  const user = await prisma.user.findUnique({
    where: { user_id: verified.payload.uid },
  });
  req.user = user;

  return next();
};
