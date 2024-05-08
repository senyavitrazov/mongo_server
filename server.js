const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const projectRouter = require('./routes/project-routes');
const defectRouter = require('./routes/defect-routes');
const userRouter = require('./routes/user-routes');

const PORT = 5555;
const URL_TO_DB = "mongodb://127.0.0.1:27017/graduation_project_db";

const app = express();
app.use(
  cors({
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    //credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());
app.use(projectRouter);
app.use(defectRouter);
app.use(userRouter);

mongoose
  .connect(URL_TO_DB)
  .then( () => console.log('Connected to DB'))
  .catch( () => console.log(`DB connection error: ${err}`))

app.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Listening port ${PORT}`);
});

