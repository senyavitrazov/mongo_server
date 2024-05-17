const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const projectRouter = require('./routes/project-routes');
const defectRouter = require('./routes/defect-routes');
const userRouter = require('./routes/user-routes');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error-middleware');

require("dotenv").config();

const PORT = process.env.PORT || 5555;
const URL_TO_DB = "mongodb://127.0.0.1:27017/graduation_project_db";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000/", "http://127.0.0.1:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());
app.use(projectRouter);
app.use(defectRouter);
app.use(userRouter);
app.use(errorMiddleware);

mongoose
  .connect(URL_TO_DB)
  .then( () => console.log('Connected to DB'))
  .catch( () => console.log(`DB connection error: ${err}`))

app.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Listening port ${PORT}`);
});

