const { Project } = require("../models/project");
  
const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getProjects = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const isArchived = req.query.archived === "true";
  const sortBy = req.query.sortBy || "project_title";
  const sortOrder = req.query.sortOrder || "desc"; // desc & asc
  const searchQuery = req.query.search || "";
  const searchField = req.query.searchField || "project_title"; 

  //example: GET /projects?page=1&limit=10&archived=true&sortBy=project_title&sortOrder=asc&search=mysearch&searchField=description


  const query = {};
  if (typeof isArchived === "boolean") {
    query.is_archived = isArchived;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  if (searchQuery && searchField) {
    query[searchField] = { $regex: searchQuery, $options: "i" };
  }

  Project.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .then((projects) => {
      Project.estimatedDocumentCount(query)
        .then((count) => {
          res.status(200).json({ count, projects });
        })
        .catch((e) => handleError(res, e));
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

const getFullProject = (req, res) => {
  Project.findById(req.params.id)
    .populate("list_of_defects")
    .populate("list_of_users_with_access")
    .then((project) => {
      res
        .status(200) //OK
        .json(project);
    })
    .catch((e) => handleError(res, e));
};

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
  getFullProject,
  addProject,
  deleteProject,
  updateProject,
};
