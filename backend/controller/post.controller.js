const Post = require("../models/posts");
const upload = require('../middleware/upload');



// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        console.log("post get")
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ error: "server error" });
    }
};


// Get one post by id
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

// DELETE one post via id
exports.deletePostById = async (req, res) => {
    try {
        const post = await Post.deleteOne({ _id: req.params.id }); 
        console.log('post', post);

        if (post.deletedCount === 1) {
            res.status(204).send({ message: "Deleted" });
        } else {
            res.status(404).send({ error: "Post does not exist!" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Something went wrong" });
    }
};

// Post-Create new post
exports.createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).send(newPost);
    } catch (error) {
        res.status(500).send({ error: "Failed to create post" });
    }
};

  // Patch-Update one post via id
exports.updatePostById = async (req, res) => {
 try { 
     const post = await Post.findOne({ _id: req.params.id  });

  if (req.body.title) {
      post.title = req.body.title
  }

  if (req.body.location) {
      post.location = req.body.location
  }

  if (req.body.image_id) {
      post.image_id = req.body.image_id
  }

  if (req.body.txt) {
    post.txt = req.body.txt
  }

    await post.save();            // Speichern der aktualisierten Daten im Mongoose-Modell
    res.send(post);
    } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong" });
    }
};