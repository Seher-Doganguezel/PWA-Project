const express = require('express');
const router = express.Router();
const  ObjectId = require('mongodb').ObjectId

// GET all posts
router.get('/', async (req, res) => {
    try {
        const collection = await connectToDB();
        const allPosts = await collection.find().toArray();
        res.status(200).send(allPosts);
    } catch (error) {
        res.status(500).send({ error: "server error" });
    }
});

// POST one new post
router.post('/', async(req, res) => {

    try {
        const newPost = {
            title: req.body.title,
            location: req.body.location,
            image_id: req.body.image_id,
            txt: req.body.txt 
        }
        const result = await collection.insertOne(newPost);
        res.status(201);
        res.send(result);
    } catch {
        res.status(404);
        res.send({
            error: "Post does not exist!"
        });
    }
});

// GET one post by id
router.get('/:id', async(req, res) => {

    try {
        const id_obj = new ObjectId(req.params.id);
        const post = await collection.find( {_id: id_obj } ).toArray();
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
