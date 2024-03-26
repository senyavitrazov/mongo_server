const mongoose = require("mongoose");

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

const User = mongoose.model("User", userSchema);

module.exports = { User };
