const express = require("express");
const multer = require("multer");
const router = express.Router();
const Book = require("../models/Book");
const Author = require("../models/Author");
const path = require("path");
const uploadPath = path.join("public", Book.coverImagePath);
const fs = require("fs");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

router.get("/", async (req, res) => {
   let query = Book.find();
   
   if(req.query.title != null && req.query.title != null){
      query = query.regex("title", new RegExp(req.query.title, "i"))
   }

   if(req.query.publishBefore != null && req.query.publishBefore != ""){
      query = query.lte("publishDate", req.query.publishBefore)
   }

   if(req.query.publishAfter != null && req.query.publishAfter != ""){
      query = query.gte("publishDate", req.query.publishAfter)
   }
   try {
      const books = await query.exec();
      res.render("books/index", {
         books: books,
         searchOptions: req.query
      })
   } catch (error) {
      res.redirect("/")
   }
  
});



router.get("/new", async (req, res) => {
   renderNewPage(res, new Book())
});

router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    description: req.body.description,
    publishDate: new Date(req.body.publishDate),
    coverImageName: fileName,
    pageCount:  req.body.pageCount,
    author: req.body.author,
  });

  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch {
   if(book.coverImageName != null)
      removeCover(book.coverImageName)
   renderNewPage(res, book, true)
  }
});


async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors: authors, book: book };

    if(hasError){
      params.errorMessage = "Error creating book"
    }

    res.render("books/new", params);
  } catch (error) {
    res.redirect("/books");
  }
}


function removeCover(fileName){
   fs.unlink(path.join(uploadPath, fileName), err => {
      if(err) console.log(err);
   })
}

module.exports = router;
