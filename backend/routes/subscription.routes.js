const express = require("express");
const webpush = require("web-push");
const router = express.Router();

const publicVapidKey =
  "BKqjdfy1FfKWsxwnki4wJKOtGZy1JeX-Tb04x0HudiKzStK5k8XTrr2FvuZcjGCE1-1E2SbDE5ZfFL3oCafQqzA";
const privateVapidKey = "6ANS0HTp1nwzyg64mQhbKXKKiWt02HHIHCI1sNVbBIw";

// Configure webpush with VAPID keys
webpush.setVapidDetails(
  "mailto:Seher.Doganguezel@htw-berlin.de",
  publicVapidKey,
  privateVapidKey
);

router.post("/", async (req, res) => {
  const subscription = req.body;
  console.log("Received subscription:", subscription);

  const payload = JSON.stringify({
    title: "Subscription Notification",
    content: "You have successfully subscribed to notifications!",
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res
      .status(201)
      .json({ message: "Subscription received and notification sent." });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Failed to send notification." });
  }
});

module.exports = router;
