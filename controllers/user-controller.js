const { User } = require("../models/user");

const handleError = (res, error) => {
  res.status(500).json({ error: error.message });
};

const getUsers = async (req, res) => {
  const { login, limit } = req.query;
  let query = {};

  if (login) {
    query = { "credentials.login": new RegExp(login, "i") };
  }

  try {
    let userQuery = User.find(query);
    if (limit && !isNaN(limit)) {
      userQuery = userQuery.limit(parseInt(limit, 10));
    }
    const users = await userQuery;
    res.status(200).json(users);
  } catch (error) {
    handleError(res, error);
  }
};

const getUser = (req, res) => {
  const userId = req.params.id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json(user);
      }
    })
    .catch((error) => {
      handleError(res, error);
    });
};

const addUser = async (req, res) => {
  try {
    const usersData = Array.isArray(req.body) ? req.body : [req.body];
    const savedUsers = [];
    for (const userData of usersData) {
      const { credentials, role, local_id } = userData;
      const newUser = new User({
        credentials: credentials,
        role: role || false,
        local_id,
      });
      const savedUser = await newUser.save();
      savedUsers.push(savedUser);
    }
    res.status(201).json(savedUsers);
  } catch (error) {
    handleError(res, error);
  }
};


const updateUser = (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;

  User.findByIdAndUpdate(userId, updatedUser, { new: true })
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json(user);
      }
    })
    .catch((error) => {
      handleError(res, error);
    });
};

const deleteUser = (req, res) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json({ message: "User deleted successfully" });
      }
    })
    .catch((error) => {
      handleError(res, error);
    });
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
};
