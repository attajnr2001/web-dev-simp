const express = require("express");
const router = express.Router();
const Author = require("../models/Author");

router.get("/", async (req, res) => {
   const searchOptions = {};
   if(req.query.name != null && req.query.name !== ""){
      searchOptions.name = new RegExp(req.query.name, "i");
   }
   try {
      const authors = await Author.find(searchOptions);
      res.render("authors/index", {
         authors: authors,
         searchOptions: req.query
      });
   } catch (error) {
      res.redirect("/")
   }
 
});

router.get("/new", (req, res) => {
  res.render("authors/new", {
    author: new Author(),
  });
});

router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
   const newAuthor = await author.save();
   req.flash("success_msg", "Registration successful")
   res.redirect("authors");
  } catch (error) {
    res.render("authors/new", {
      author: new Author(),
      errorMessage: "Error creating author",
    });
  }
});

module.exports = router;
