const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  commenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  text_of_comment: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: Date(Date.now()),
  },
});

const stateSchema = new mongoose.Schema({
  date: {
    type: String,
    default: Date(Date.now()),
  },
  type_of_state : {
    type: String,
    enum: ["open", "in_progress", "fixed"],
    default: "open",
  },
});

const defectSchema = new mongoose.Schema({
  current_state: {
    type: stateSchema,
    default: () => ({ type_of_state: "open", date: Date(Date.now())}),
  },
  defect_title: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  severity: {
    type: String,
    enum: ["critical", "major", "average", "minor"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    required: true,
  },
  description: {
    type: String,
    default: "Description of the defect",
  },
  logs: {
    list_of_comments: [commentSchema],
    list_of_states: [stateSchema],
  },
});

const Defect = mongoose.model("Defect", defectSchema);

module.exports = { Defect };
