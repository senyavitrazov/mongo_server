const express = require("express");
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/user-controller");

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.delete("/users/:id", deleteUser);
router.post("/users", addUser);
router.patch("/users/:id", updateUser);

module.exports = router;
