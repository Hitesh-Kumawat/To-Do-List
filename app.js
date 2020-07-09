//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kumawat_hitesh:hitesh123@cluster0.c2tov.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const day = date.getDate();

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Web Development"
});

const item2 = new Item({
  name: "Algorithmic Toolbox"
});

const item3 = new Item({
  name: " VIT"
});

const defaultItem = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  Item.find({}, function(err, result) {
    if(err){
      console.log(err)
    }

    if(result.length === 0){
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("Successfully saved to the DB")
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: day, newListItems: result});
    }
  });

});

app.post("/delete", function(req, res){
  const currentItemId = req.body.checkbox;
  const listName = req.body.listTitle;

  if(listName === day){
    Item.remove({_id: currentItemId}, function(err){
      if(err){
        console.log(err)
      }
      else{
        console.log("Successfully removed item: " + currentItemId)
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: currentItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.post("/", function(req, res) {

  const item = req.body.newItem;
  const listTitle = req.body.list;

  const addItem = new Item({
    name: item
  });

  if(listTitle === day){
    addItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listTitle}, function(err, foundList){
        foundList.items.push(addItem);
        foundList.save();
        res.redirect("/" + listTitle);
      });
  }

  // Item.create(addItem, function(err){
  //   if(err){
  //     console.log(err)
  //   }
  //   else{
  //     console.log("Successfully added an Item.")
  //   }
  // });
  // res.redirect("/");

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
 });

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, obj){
      if(!obj){
        const list = new List({
          name: customListName,
          items: defaultItem
        });

        list.save();
        res.redirect("/" + customListName);
    }
    else{
      res.render("list", {listTitle: obj.name, newListItems: obj.items});
    }
      //console.log(obj)
    });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
