const Post = require("../models/posts");
const upload = require("../middleware/upload"); // If it's not used, you should remove it

exports.getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find();
    const sendAllPosts = await Promise.all(
      allPosts.map(async (post) => {
        try {
          return await getOnePost(post._id);
        } catch (err) {
          console.error(`Error fetching post with id ${post._id}:`, err);
          return null;
        }
      })
    ).filter((post) => post !== null);

    res.status(200).send(sendAllPosts);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).send({ error: "Failed to fetch posts" });
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
    console.error(
      `Server error fetching post with id ${req.params.id}:`,
      error
    );
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
