const { Project } = require("../models/project");
  
const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getProjects = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const isArchived = req.query.archived === "true";

  ///projects?page=1&limit=10&archived=true

  const query = {};
  if (typeof isArchived === "boolean") {
    query.is_archived = isArchived;
  }

  Project.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .then((projects) => {
      res
        .status(200) //OK
        .json(projects);
    })
    .catch((e) => handleError(res, e));
}

const getProject = (req, res) => {
  Project
    .findById(req.params.id)
    .then((project) => {
      res
        .status(200) //OK
        .json(project);
    })
    .catch((e) => handleError(res, e));
}

const deleteProject = (req, res) => {
  Project
    .findByIdAndDelete(req.params.id)
    .then((project) => {
      res
        .status(200) //OK
        .json(project);
    })
    .catch((e) => handleError(res, e));
};

const addProject = (req, res) => {
  const project = new Project(req.body);

  project
    .save()
    .then((result) => {
      res
        .status(201)
        .json(result);
    })
    .catch((e) => handleError(res, e));
};

const updateProject = (req, res) => {
  Project
    .findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      res
        .status(200)
        .json(result);
    })
    .catch((e) => handleError(res, e));
};

module.exports = {
  getProjects,
  getProject,
  addProject,
  deleteProject,
  updateProject,
};
