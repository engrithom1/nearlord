const express = require('express')
const router = express.Router();

const blogController = require("../controllers/blogController");
const mainController = require("../controllers/mainController");

///All of this Routes starts by /articulos
router.get("/articulos", blogController.spBlogPage);
router.get("/articulos/:slug", blogController.spSingleBlog);
router.get("/articulos/category/:slug", blogController.spBlogCategory);

router.get("/", mainController.spHome);
router.get("/sobre", mainController.spAbout);
router.get("/404", mainController.sp_404);

module.exports = router; 