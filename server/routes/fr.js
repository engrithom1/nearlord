const express = require('express')
const router = express.Router();

const blogController = require("../controllers/blogController");
const mainController = require("../controllers/mainController");


router.get("/", mainController.frHome);
router.get("/apropos", mainController.frAbout);
router.get("/404", mainController.fr_404);

///All of this Routes starts by /articulos
router.get("/articles", blogController.frBlogPage);
router.get("/articles/:slug", blogController.frSingleBlog);
router.get("/articles/categorie/:slug", blogController.frBlogCategory);



module.exports = router; 