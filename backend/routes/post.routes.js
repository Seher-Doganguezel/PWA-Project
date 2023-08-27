const express = require('express');
const router = express.Router();
const postController = require("../controller/post.controller");


// GET all posts
router.get("/", postController.getAllPosts)

// POST create a post
router.post("/", postController.createPost)

router.get("/:id", postController.getPostById)

router.delete("/:id", postController.deletePostById)

router.patch("/:id", postController.updatePostById)


module.exports = router;
