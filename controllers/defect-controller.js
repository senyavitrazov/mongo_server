const { Defect } = require("../models/defect");
const { Project } = require("../models/project");

const handleError = (res, error) => {
  res.status(500).json({ error });
};

const getDefects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "_id",
      sortOrder = "asc",
      search = "",
    } = req.query;
    const query = await buildSearchQuery(search);
    const sortOptions = buildSortOptions(sortBy, sortOrder);
    const defects = await executeDefectSearch(
      query,
      sortOptions,
      parseInt(page),
      parseInt(limit)
    );
    const count = await Defect.countDocuments(query);
    res.status(200).json({ count, defects });
  } catch (error) {
    console.error("Error occurred while searching defects:", error);
    res.status(500).json({ error: "Error occurred while searching defects" });
  }
};

const executeDefectSearch = async (query, sortOptions, page, limit) => {
  try {
    const defects = await Defect.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("project", "project_title");
    return defects;
  } catch (error) {
    console.error("Error occurred while executing defect search:", error);
    throw error;
  }
};

const buildSearchQuery = async (search) => {
  try {
    const searchRegex = search ? new RegExp(search, "i") : null;
    if (!searchRegex) return {};

    const projects = await Project.find({ project_title: searchRegex });
    const projectIds = projects.map((project) => project._id);

    return {
      $or: [
        { defect_title: searchRegex },
        { severity: searchRegex },
        { priority: searchRegex },
        { description: searchRegex },
        { project: { $in: projectIds } },
      ],
    };
  } catch (error) {
    console.error("Error occurred while building search query:", error);
    throw error;
  }
};

const buildSortOptions = (sortBy, sortOrder) => {
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
  return sortOptions;
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
