//| |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| |//
/// ///// A "to do list" app that connects to an external mongoose atlas database ///// |//
//| |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| ||/

//= import modules
const express = require(`express`);
const mongoose = require(`mongoose`);
const date = require(__dirname + `/date.js`);

//= set variables
const app = express();

app.set(`view engine`, `ejs`);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + `/public`));

//= connect to the mongodb database
//= if db doesn't exist then it will be created
mongoose.connect(`mongodb+srv://admin-user:test123@cluster0.zbzbtw8.mongodb.net/todolistdb?ssl=true&authSource=admin&w=majority`);

//= create new mongoose schema
const itemSchema = {
  name: String
};

//= create mongoose model
const Item = new mongoose.model(
  `Item`,
  itemSchema
);

//= create new list items for default list
const item1 = new Item({
  name: "First item in the todolist!"
});

const item2 = new Item({
  name: "Second item in the todolist!"
});

const item3 = new Item({
  name: "Third item in the todolist!"
});

//= put items into an array
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

//= render list.ejs when user goes to /apps/todolistdb
app.get(`/apps/todolistdb`, function (req, res) {
  const day = date.getDate();
  Item.find({}, function (err, foundItems) {
    //! the following is only for if we have an empty list and we
    //! want to insert some default items to populate it
    // if (foundItems.length === 0) {
    //   Item.insertMany(defaultItems, function (err) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log("Successfully saved all the items to todolistDB!");
    //     }
    //   });
    // } else {
    res.render(`list`, { listTitle: day, items: foundItems });
    // }
  });
});

//= if the user decides to create a new list
app.get(`/apps/todolistdb/:page`, function (req, res) {
  const customListName = req.params.page;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //= create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect(`/apps/todolistdb/${customListName}`)
      } else {
        //= show existing list
        res.render(`list`, { listTitle: foundList.name, items: foundList.items })
      }
    }
  })
})

//= when the user posts a new list item
app.post(`/apps/todolistdb`, function (req, res) {
  const day = date.getDate();
  const itemName = req.body.newItem; //# get value from input in list.ejs
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect(`/apps/todolistdb`); //# when the user clicks the add button it will go to the home route
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/apps/todolistdb/${listName}`);
    })
  }

});

//= when the user decides to delete an item
app.post(`/apps/todolistdb/delete`, function (req, res) {

  const day = date.getDate();
  const checkedID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedID, function (err) {
      if (!err) {
        //\ console.log(`item deleted`);
        res.redirect(`/apps/todolistdb`);
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedID } } }, function (err, foundList) {
      if (!err) {
        res.redirect(`/apps/todolistdb/${listName}`);
      }
    });
  }

});

//= listen on port
app.listen(666, function () {
  console.log(`Server started on port 666`)
});