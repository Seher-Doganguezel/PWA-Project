const webpush = require("web-push");

const publicVapidKey =
  "BKqjdfy1FfKWsxwnki4wJKOtGZy1JeX-Tb04x0HudiKzStK5k8XTrr2FvuZcjGCE1-1E2SbDE5ZfFL3oCafQqzA";
const privateVapidKey = "6ANS0HTp1nwzyg64mQhbKXKKiWt02HHIHCI1sNVbBIw";

const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cMdUtRW4H9o:APA91bG8p3o-Ta31e1yMrqdvonJCyf3xbPfIFtpS2UbX9PcJwkeNKoQjZhEAWo5nad7eR3NgRQR8__3wk591j7DKWJLGzwWgJYm_GgipU0gTvMRpWA6TpmCtrD9OCo1mB0jZQrTj5a_5",
  keys: {
    auth: "fJRvyO_fnPXsYeDkMy_jAA",
    p256dh:
      "BDhH_TBG4l-PU3wJnT6wHqsPeYusbPqOiw7VvJvupXDC3JZOIIOiz2Ml8ZaZD9wJuGnXs9BFqINEzrFStsjkk6c",
  },
};

exports.sendNotification = (req, res, next) => {
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

  webpush.sendNotification(pushSubscription, payload).catch((err) => {
    console.error("Error sending notification", err);
  });

  console.log("push notification sent");
  next();
};
