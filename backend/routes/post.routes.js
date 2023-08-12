const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectId
const postController = require("../controller/post.controller");

// GET all posts
router.get("/", postController.getAllPosts)

// POST create a post
router.post("/", postController.createPost)

router.get("/:id", postController.getPostById)

// GET one post by id
router.get('/:id', async (req, res) => {

    try {
        const id_obj = new ObjectId(req.params.id);
        const post = await collection.find({ _id: id_obj }).toArray();
        console.log('post', req.params.id)
        res.status(202);
        res.send(post);
    } catch {
        res.status(404);
        res.send({
            error: "Post does not exist!"
        });
    }
});


module.exports = router;
