const express = require("express");

const { 
  getProjects,
  getProject,
  getFullProject,
  deleteProject,
  addProject,
  updateProject
} = require("../controllers/project-controller");

const router = express.Router();

router.get("/projects", getProjects);
router.get("/projects/:id", getProject);
router.get("/projects/:id/details", getFullProject);
router.delete("/projects/:id", deleteProject);
router.post("/projects", addProject);
router.patch("/projects/:id", updateProject);



module.exports = router; 
