const Post = require("../models/posts");

exports.getAllPosts = async (req, res) => {
    try {
        console.log("post get")
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ error: "server error" });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send({ error: "Post not found" });
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(500).send({ error: "server error" });
    }
};

exports.createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).send(newPost);
    } catch (error) {
        res.status(500).send({ error: "Failed to create post" });
    }
};

