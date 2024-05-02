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
      priority = "",
      severity = "",
    } = req.query;
    const query = await buildSearchQuery(search, priority, severity);
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

const buildSearchQuery = async (search, priority, severity) => {
  try {
    const searchRegex = search ? new RegExp(search, "i") : null;
    const priorityRegex = priority ? new RegExp(priority, "i") : null;
    const severityRegex = severity ? new RegExp(severity, "i") : null;
    
    if (searchRegex) {
      const projects = await Project.find({ project_title: searchRegex });
      const projectIds = projects.map((project) => project._id);

      const query = {
        $or: [
          { defect_title: searchRegex },
          { severity: searchRegex },
          { priority: searchRegex },
          { description: searchRegex },
        ],
        };

      if (projectIds.length > 0) {
        query.$or.push({ project: { $in: projectIds } });
      }

      if (priorityRegex || severityRegex) {
        query.$and = [];
        if (priorityRegex) {
          query.$and.push({ priority: priorityRegex });
        }
        if (severityRegex) {
          query.$and.push({ severity: severityRegex });
        }
      }

      return query;
    } else {
      if (!priorityRegex && !severityRegex) {
        return {};
      } else if (!priorityRegex) {
        return {
          $or: [
            { severity: severityRegex },
            { priority: priorityRegex },
            { description: searchRegex },
          ],
        };
      } else if (!severityRegex) {
        return {
          $or: [{ priority: priorityRegex }, { description: searchRegex }],
        };
      } else {
        return {
          $and: [{ severity: severityRegex }, { priority: priorityRegex }],
        };
      }
    }
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
  const { projectId, current_state, ...defectData } = req.body;
  const currentState = current_state 
    ? current_state 
    : { type_of_state: "open", date: Date.now() };
  const defect = new Defect({
    ...defectData,
    project: projectId,
  });

  if (defect.logs.list_of_states.length === 0) {
    defect.logs.list_of_states.push(currentState);
  }

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
