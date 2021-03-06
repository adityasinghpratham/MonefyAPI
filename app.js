const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const { Logger } = require("mongodb");
mongoose.connect(
    'mongodb+srv://aditya_admin:aditya@cluster0.aajkb.mongodb.net/first?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}
);
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests

app.use("/user", userRoutes);
app.use("/group", groupRoutes);
app.get("/",(req, res, next)=> {
  res.send("Hello from API");
})
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
// app.use((error, req, res, next) => {
//   res.status(error.status || 500);
//   res.json({
//     error: {
//       message: error.message
//     }
//   });
// });

const port = process.env.PORT || 8080;

app.listen(port);