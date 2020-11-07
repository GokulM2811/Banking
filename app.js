require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.set('view engine', 'ejs');

const userschema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number,
  age: Number,
  location: String,
  accountno: Number
});

const transactionschema = new mongoose.Schema({
  sender: String,
  reciever: String,
  amount: Number
});

const Transaction = mongoose.model("Transaction", transactionschema);
const User = mongoose.model("User", userschema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("home.ejs")
});

app.get("/about",function(req,res){
  res.render("about.ejs");
});

app.get("/transactions", function(req, res) {
  Transaction.find({}, function(err, pasttrans) {
    if(!err){
      res.render("transactions.ejs", {
        detail: pasttrans
      });
    } else {
      console.log(err);
    }

  });
});

app.get("/details", function(req, res) {
  User.find({}, function(err, users) {
    if(!err){
      res.render("details.ejs", {
        detail: users
      });
    } else {
      console.log(err);
    }
  });
});

app.post("/details2", function(req, res) {
  User.find({}, function(err, users) {
    res.render("details2.ejs", {
      sender: req.body.usersid,
      detail: users
    });
  });
});

app.post("/transfer", function(req, res) {
  res.render("transfer.ejs", {
    sends: req.body.usersfrom,
    recieves: req.body.usersto
  });
});

app.post("/complete", function(req, res) {
  let from = req.body.from;
  let to = req.body.to;
  let fund = req.body.amount;
  if (fund > 0) {
    User.findOne({
      name: from
    }, function(err, send) {
      if (!err) {
        if (send.balance >= fund) {
          User.findOneAndUpdate({
            name: from
          }, {
            $set: {
              balance: Number(send.balance) - Number(fund)
            }
          }, function(err, result) {
            if (!err) {}
          });
          User.findOne({
            name: to
          }, function(err, getter) {
            if (!err) {
              User.findOneAndUpdate({
                name: to
              }, {
                $set: {
                  balance: Number(getter.balance) + Number(fund)
                }
              }, function(err, result) {
                if (!err) {}
              });
            }
          });
          const trans = new Transaction({
            sender: from,
            reciever: to,
            amount: fund
          });
          trans.save(function(err) {
            if (!err) {
              res.render("result.ejs",{
                error: 2
              });
            }
          });
        } else {
          res.render("result.ejs",{
            error: 0
          });
        }
      }
    });
  } else {
    res.render("result.ejs",{
      error: 1
    });
  }
});

app.get("/contact",function(req,res){
  res.render("contact.ejs");
});

app.get("/:username", function(req, res) {
  let search = req.params.username;
  User.findOne({
    name: search
  }, function(err, item) {
    res.render("info.ejs", {
      display: item
    });
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

app.listen(port, function() {
  console.log("Server started on port 4000");
});
