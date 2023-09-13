const express = require("express");
const router = express.Router();
const postController = require("../controller/post.controller");
const upload = require("../middleware/upload");
const notificationMiddleware = require("../middleware/notification");
const { errorHandler } = require("../middleware/errorHandler");

const webpush = require("web-push");

console.log("Type of errorHandler:", typeof errorHandler); // DEBUGGEN

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
router.get("/", postController.getAllPosts);
router.post(
  "/",
  upload.single("file"),
  postController.createPost,
  notificationMiddleware.sendNotification
);
router.get("/:id", postController.getPostById);
router.delete("/:id", postController.deletePostById);
router.patch("/:id", postController.updatePostById);

// Error Handler - Place this at the end of the routes
router.use(errorHandler);

module.exports = router;
