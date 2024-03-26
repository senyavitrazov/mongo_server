const { Defect } = require("../models/defect");
const { Project } = require("../models/project");

const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getDefects = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || "severity";
  const sortOrder = req.query.sortOrder || "asc"; // desc & asc
  const searchQuery = req.query.search || "";
  const searchField = req.query.searchField || "defect_title";

  const query = {};
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  if (searchQuery && searchField) {
    query[searchField] = { $regex: searchQuery, $options: "i" };
  }

  Defect.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("project", "project_title")
    .then((defects) => {
      res.status(200).json(defects);
    })
    .catch((e) => handleError(res, e));
};

const getDefect = (req, res) => {
  Defect.findById(req.params.id)
    .populate("project", "project_title")
    .then((defect) => {
      res.status(200).json(defect);
    })
    .catch((e) => handleError(res, e));
};

const deleteDefect = (req, res) => {
  Defect
    .findByIdAndDelete(req.params.id)
    .then((defect) => {
      return Project.findOneAndUpdate(
        { list_of_defects: req.params.id },
        { $pull: { list_of_defects: req.params.id } },
        { new: true }
      );
    })
    .then((project) => {
      res.status(200).json({ message: "Defect deleted successfully", project });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

const addDefect = (req, res) => {
  const { projectId, ...defectData } = req.body;
  const defect = new Defect({
    ...defectData,
    project: projectId,
  });

  defect
    .save()
    .then((savedDefect) => {
      return Project.findByIdAndUpdate(
        projectId,
        { $push: { list_of_defects: savedDefect._id } },
        { new: true }
      ).then((updatedProject) => {
        res
          .status(201)
          .json({
            message: "Defect created successfully",
            defect: savedDefect,
            project: updatedProject,
          });
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};


const updateDefect = (req, res) => {
  Defect
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedDefect) => {
      res
        .status(200)
        .json({
          message: "Defect updated successfully",
          defect: updatedDefect,
        });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

module.exports = {
  getDefects,
  getDefect,
  addDefect,
  deleteDefect,
  updateDefect,
};
