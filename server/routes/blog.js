const express = require('express')
const router = express.Router();

const blogController = require("../controllers/blogController");

///All of this Routes starts by /blog
router.get("/", blogController.blogPage);
router.get("/:slug", blogController.singleBlog);
router.get("/category/:slug", blogController.blogCategory);

module.exports = router; 