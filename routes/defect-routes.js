const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");

const {
  getDefects,
  getDefect,
  addDefect,
  deleteDefect,
  updateDefect
} = require("../controllers/defect-controller");

const router = express.Router();

router.get("/defects", authMiddleware, getDefects);
router.get("/defects/:id", getDefect);
router.delete("/defects/:id", deleteDefect);
router.post("/defects", addDefect);
router.patch("/defects/:id", updateDefect);

module.exports = router;
