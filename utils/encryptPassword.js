const bcrypt = require("bcrypt"); // encrypt password
exports.enCryptPassword = async(password) => {
  return bcrypt
    .hash(password, 10) // change encode password - 10 : salt
    .then((hash) => {
      return Promise.resolve(hash);
    })
    .catch((err) => {
      Logger.error(`encrypt password fail: ${err}`);
    });
};
