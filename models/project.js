const mongoose = require('mongoose');
const { User } = require("./user");
const { Defect } = require("./defect");

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
  list_of_users_with_access: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  ],
  list_of_defects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Defect",
    },
  ],
});

const Project = mongoose.model("Project", projectSchema);

module.exports = { Project };
