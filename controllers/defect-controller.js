const { Defect } = require("../models/defect");
const { Project } = require("../models/project");
const { formatDate } = require("../func/formatDate");

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
      priority = "",
      severity = "",
      archived = "false",
    } = req.query;

    const { role: is_admin, id } = req.user;

    const query = await buildSearchQuery(search, priority, severity, archived, is_admin, id);
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

const buildSearchQuery = async (
  search,
  priority,
  severity,
  archived,
  is_admin,
  id
) => {
  try {
    const searchRegex = search ? new RegExp(search, "i") : null;
    const priorityRegex = priority ? new RegExp(priority, "i") : null;
    const severityRegex = severity ? new RegExp(severity, "i") : null;

    const query = {};

    // Add the archived condition
    if (archived !== "true") {
      query["current_state.type_of_state"] = { $ne: "archived" };
    }

    // Handle non-admin user access restriction
    if (!is_admin) {
      const projectsWithAccess = await Project.find({
        list_of_users_with_access: { $in: [id] },
      });
      const projectIds = projectsWithAccess.map((project) => project._id);
      if (projectIds.length === 0) {
        return { _id: { $exists: false } }; // Return an empty result query
      }
      query["project"] = { $in: projectIds };
    }

    const andConditions = [];

    // Add search conditions to the $or clause
    if (searchRegex) {
      const orConditions = [
        { defect_title: searchRegex },
        { description: searchRegex },
      ];

      const projects = await Project.find({ project_title: searchRegex });
      const projectIds = projects.map((project) => project._id);
      if (projectIds.length > 0) {
        orConditions.push({ project: { $in: projectIds } });
      }

      andConditions.push({ $or: orConditions });
    }

    // Add priority and severity conditions directly to the $and clause
    if (priorityRegex) {
      andConditions.push({ priority: priorityRegex });
    }

    if (severityRegex) {
      andConditions.push({ severity: severityRegex });
    }

    // Ensure all conditions are applied
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    return query;
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
    .populate({
      path: "logs.list_of_comments",
      model: "User",
      select: "commenter",
    })
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
    .then((defect) => {
      res.status(200).json({ message: "Defect deleted successfully", defect });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

const addDefect = (req, res) => {
  const { project, current_state, ...defectData } = req.body;
  const currentState = current_state
    ? current_state
    : { type_of_state: "open", date: formatDate(Date.now()) };
  const defect = new Defect({
    ...defectData,
    project,
  });

  if (defect.logs.list_of_states.length === 0) {
    defect.logs.list_of_states.push(currentState);
  }

  defect
    .save()
    .then((savedDefect) => {
      return Project.findByIdAndUpdate(
        project,
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
      console.error("Error while saving defect:", error);
      res
        .status(500)
        .json({ error: error.message, problem: "Failed to save defect" });
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
