const express = require("express");

const { 
  getProjects,
  getProject,
  deleteProject,
  addProject,
  updateProject
} = require("../controllers/project-controller");

const router = express.Router();

router.get("/projects", getProjects);
router.get("/projects/:id", getProject);
router.delete("/projects/:id", deleteProject);
router.post("/projects", addProject);
router.patch("/movie/:id", updateProject);

module.exports = router; 
