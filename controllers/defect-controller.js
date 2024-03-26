const { Defect } = require("../models/defect");

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
  Defect.findByIdAndDelete(req.params.id)
    .then((defect) => {
      res.status(200).json(defect);
    })
    .catch((e) => handleError(res, e));
};

const addDefect = (req, res) => {
  const defect = new Defect(req.body);

  defect
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((e) => handleError(res, e));
};

const updateDefect = (req, res) => {
  Defect.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((e) => handleError(res, e));
};

module.exports = {
  getDefects,
  getDefect,
  addDefect,
  deleteDefect,
  updateDefect,
};
