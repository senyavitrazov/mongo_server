const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commenter_name: {
    type: String,
    default: "Anonymous",
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
  type_of_state: {
    type: String,
    enum: ["open", "in_progress", "fixed"],
    required: true,
  }
});

const defectSchema = new mongoose.Schema({
  current_state: stateSchema,
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

const projectSchema = new mongoose.Schema({
  is_archived: {
    type: Boolean,
    default: false,
  },
  project_title: {
    type: String,
    required: true,
  },
  date_of_creation: {
    type: String,
    default: Date(Date.now()),
  },
  description: {
    type: String,
    default: "Description of the project",
  },
  list_of_users_ids_with_access: [String],
  list_of_defects: {
    type: [defectSchema],
    required: false,
  },
});

const userSchema = new mongoose.Schema({
  credentials: {
    login: {
      type: String,
      required: true,
    },
    hash_of_passwords: {
      type: String,
      required: true,
    },
  },
  role: {
    type: Boolean,
    default: false, //admin
  },
  local_id: String,
});

const Project = mongoose.model("Project", projectSchema);

const User = mongoose.model("User", userSchema);

module.exports = { Project, User };
