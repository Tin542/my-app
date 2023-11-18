module.exports = response = (ok, status, msg, data) => {
  return {
    ok: ok,
    status: status,
    msg: msg,
    data: data,
  };
};
