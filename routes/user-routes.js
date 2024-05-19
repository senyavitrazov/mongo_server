const express = require("express");
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/user-controller");
const acountController = require("../controllers/account-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.delete("/users/:id", deleteUser);
router.post("/user", addUser);
router.patch("/users/:id", updateUser);

router.post("/registration", acountController.registration);
router.post("/login", acountController.login);
router.post("/logout", acountController.logout);
router.get("/refresh", acountController.refresh);

module.exports = router;
