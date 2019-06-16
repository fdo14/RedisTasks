var express = require("express");
var redis = require("redis");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");

var app = express();

var client = redis.createClient();

client.on("connect", function() {
  console.log("redis connected");
});

app.set("views"), path.join(__dirname, "views");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
  var title = "Task App";
  client.lrange("tasks", 0, -1, function(err, reply) {
    client.hgetall("call", function(err, call) {
      res.render("index", {
        title: title,
        tasks: reply,
        call: call
      });
    });
  });
});

app.post("/task/add", function(req, res) {
  var task = req.body.task;

  client.rpush("tasks", task, function(err, reply) {
    if (err) console.log(err);
    else console.log("Task Added....");
    res.redirect("/");
  });
});

app.post("/task/delete", function(req, res) {
  var tasksToDdel = req.body.tasks;

  client.lrange("tasks", 0, -1, function(err, tasks) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasksToDdel.indexOf(tasks[i]) > -1) {
        client.lrem("tasks", 0, tasks[i], function() {
          if (err) console.log(err);
        });
      }
    }
    res.redirect("/");
  });
});

app.post("/call/add", function(req, res) {
  var newCall = {};

  newCall.name = req.body.name;
  newCall.company = req.body.company;
  newCall.phone = req.body.phone;
  newCall.time = req.body.time;

  client.hmset(
    "call",
    [
      "name",
      newCall.name,
      "company",
      newCall.company,
      "phone",
      newCall.phone,
      "time",
      newCall.time
    ],
    function(err, reply) {
      if (err) console.log(err);
      else console.log(reply);
      res.redirect("/");
    }
  );
});

app.listen(3000);
console.log("server started on port 2000");

module.exports = app;
