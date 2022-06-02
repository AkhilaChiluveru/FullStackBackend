const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const queryService = require("./pool");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const { createUser, getUserByUsername } = queryService;

app.get("/", (req, res) => {
  res.json({ responsetype: "service is up!!" });
});

app.post("/createUser", (req, res) => {
  createUser(req, res);
  // res.json({ responsetype: "service is up!!" });
});

app.get("/getUser", (req, res) => {
  getUserByUsername(req, res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
