const express = require('express')
const router = express.Router();

const mainController = require("../controllers/mainController");
const blogController = require("../controllers/blogController");
const bibleController = require("../controllers/bibleController");

///All of this Routes starts by /blog
router.get("/blog", blogController.blogPage);
router.get("/blog/:slug", blogController.singleBlog);
router.get("/blog/category/:slug", blogController.blogCategory);

///All of this Routes starts by /bible
router.get("/bible", bibleController.biblePage);
router.get("/bible/:slug", bibleController.bookPage);
router.get("/bible/:slug/:chapter", bibleController.bookVersesPage);

router.get("/", mainController.home);
router.get("/about", mainController.about);
router.get("/404", mainController.en_404);

module.exports = router; 