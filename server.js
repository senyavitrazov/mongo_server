const express = require('express');
const mongoose = require("mongoose");
const projectRouter = require('./routes/project-routes');

const PORT = 5555;
const URL_TO_DB = "mongodb://127.0.0.1:27017/graduation_project_db";

const app = express();
app.use(express.json());
app.use(projectRouter);

mongoose
  .connect(URL_TO_DB)
  .then( () => console.log('Connected to DB'))
  .catch( () => console.log(`DB connection error: ${err}`))

app.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Listening port ${PORT}`);
});

