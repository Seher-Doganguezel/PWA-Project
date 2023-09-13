const express = require("express");
const router = express.Router();
const postController = require("../controller/post.controller");
const upload = require("../middleware/upload");
const errorHandler = require("../middleware/errorHandler"); // Assuming you move this function to its own middleware file
const notificationMiddleware = require("../middleware/notification"); // Separated notification logic

const webpush = require("web-push");

function sendNotification() {
  webpush.setVapidDetails(
    "mailto:Seher.Doganguezel@htw-berlin.de",
    publicVapidKey,
    privateVapidKey
  );
  const payload = JSON.stringify({
    title: "New Push Notification",
    content: "New data in database!",
    openUrl: "/help",
  });
  webpush
    .sendNotification(pushSubscription, payload)
    .catch((err) => console.error(err));
  console.log("push notification sent");
  // res.status(201).json({ message: 'push notification sent'});
}

// CRUD routes for Post

// GET all posts
router.get("/", postController.getAllPosts);

// Create a new post
router.post(
  "/",
  upload.single("file"),
  postController.createPost,
  notificationMiddleware.sendNotification
);

// GET a post by ID
router.get("/:id", postController.getPostById);

// DELETE a post by ID
router.delete("/:id", postController.deletePostById);

// UPDATE a post by ID
router.patch("/:id", postController.updatePostById);

// Error Handler - Place this at the end of the routes
router.use(errorHandler);

module.exports = router;
