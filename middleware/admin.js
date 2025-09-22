// middleware/admin.js
require("dotenv").config();

module.exports = function (req, res, next) {
  const headerToken =
    req.headers["x-api-key"] ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!headerToken || headerToken !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  next();
};
