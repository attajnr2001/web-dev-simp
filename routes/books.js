const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Author = require("../models/Author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

router.get("/", async (req, res) => {
  let query = Book.find();

  if (req.query.title != null && req.query.title != null)
    query = query.regex("title", new RegExp(req.query.title, "i"));

  if (req.query.publishBefore != null && req.query.publishBefore != "")
    query = query.lte("publishDate", req.query.publishBefore);

  if (req.query.publishAfter != null && req.query.publishAfter != "")
    query = query.gte("publishDate", req.query.publishAfter);

  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => renderNewPage(res, new Book()));

// create book route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    description: req.body.description,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    author: req.body.author,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});


// show book route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch (error) {
    res.redirect("/");
  }
});

// edit book route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch (error) {
    res.redirect("/");
  }
});

// update book route
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.description = req.body.description;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.author = req.body.author;

    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    console.log(error);
    if (book != null) renderEditPage(res, book, true);
    else redirect("/");
  }
});


router.delete("/:id",async(req, res) => {
   let book;

   try {
      book = await Book.findById(req.params.id);
      await book.deleteOne({_id: req.params.id})
      res.redirect("/books")
   } catch (error) {
      console.log(error``);
      if(book != null){
         res.render("books/show", {
            book: book,
            errorMessage: "Could not delete book"
         })
      }else{
         res.redirect("/");
      }
   }
})








async function renderEditPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors: authors, book: book };

    if (hasError) params.errorMessage = "Error Updating book";

    res.render("books/edit", params);
  } catch (error) {
    res.redirect("/books");
  }
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors: authors, book: book };

    if (hasError) params.errorMessage = "Error creating book";

    res.render("books/new", params);
  } catch (error) {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
