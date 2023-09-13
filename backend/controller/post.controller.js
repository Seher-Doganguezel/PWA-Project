const Post = require("../models/posts");
const upload = require("../middleware/upload"); // If it's not used, you should remove it
const { ObjectId } = require("mongodb");

// exports.getAllPosts = async (req, res) => {
//   try {
//     const allPosts = await Post.find();
//     const sendAllPosts = await Promise.all(
//       allPosts.map(async (post) => {
//         try {
//           return await getOnePost(post._id);
//         } catch (err) {
//           console.error(`Error fetching post with id ${post._id}:`, err);
//           return null;
//         }
//       })
//     ).filter((post) => post !== null);

//     res.status(200).send(sendAllPosts);
//   } catch (error) {
//     console.error("Error fetching all posts:", error);
//     res.status(500).send({ error: "Failed to fetch posts" });
//   }
// };

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    console.log("post get");
    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (error) {
    res.status(500).send({ error: "server error" });
  }
};

// Get one post by id
exports.getPostById = async (req, res) => {
  try {
    const id = req.params.id; // Extract the id from params

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid Post ID" });
    }

    getOnePost(id)
      .then((post) => {
        if (post) {
          res.status(200).send(post);
        } else {
          res.status(404).send({ error: "Post not found" });
        }
      })
      .catch((error) => {
        res.status(500).send({ error: "Server error: " + error.message });
      });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
};

exports.deletePostById = async (req, res) => {
  try {
    const post = await Post.deleteOne({ _id: req.params.id });
    if (post.deletedCount === 1) {
      res.status(204).send({ message: "Deleted" });
    } else {
      res.status(404).send({ error: "Post does not exist!" });
    }
  } catch (error) {
    console.error(`Deletion error for post with id ${req.params.id}:`, error);
    res.status(500).send({ error: "Something went wrong during deletion" });
  }
};

exports.updatePostById = async (req, res) => {
  try {
    const updateObject = {};
    ["title", "location", "image_id", "txt"].forEach((field) => {
      if (req.body[field]) {
        updateObject[field] = req.body[field];
      }
    });
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      updateObject,
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send({ error: "Post not found" });
    }

    res.send(updatedPost);
  } catch (error) {
    console.error(`Update error for post with id ${req.params.id}:`, error);
    res.status(500).send({ error: "Something went wrong during update" });
  }
};

exports.createPost = async (req, res) => {
  try {
    // Extracting fields from the request body
    const { title, location, txt } = req.body;
    const image_id = req.file ? req.file.id : null; // Assuming you are storing the file id when uploaded

    // Validate required fields
    if (!title || !txt) {
      return res.status(400).send({ error: "Both title and txt are required" });
    }

    // Create a new Post
    const newPost = new Post({
      title,
      location,
      image_id,
      txt,
    });

    // Save the Post
    await newPost.save();

    // Send back the saved Post
    res.status(201).send(newPost);
  } catch (error) {
    console.error("Error creating a new post:", error);
    res.status(500).send({ error: "Failed to create a new post" });
  }
};

/*
function sendNotification() {
    webpush.setVapidDetails('mailto:Seher.Doganguezel@htw-berlin.de', publicVapidKey, privateVapidKey);
    const payload = JSON.stringify({
        title: 'New Push Notification',
        content: 'New data in database!',
        openUrl: '/help'
    });
    webpush.sendNotification(pushSubscription,payload)
        .catch(err => console.error(err));
    console.log('push notification sent');
    // res.status(201).json({ message: 'push notification sent'});
} */
