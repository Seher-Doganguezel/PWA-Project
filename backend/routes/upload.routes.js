const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectID;
let bucket;
mongoose.connection.once("open", () => {
  const database = mongoose.connection.db;
  gfs = Grid(database, mongoose.mongo);
  gfs.collection("uploads");
  bucket = new mongodb.GridFSBucket(database, {
    bucketName: "uploads",
  });
});

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file selected" });
  }

  const imgUrl = `http://localhost:8000/upload/${req.file.filename}`;
  res.status(201).send({ url: imgUrl });
});

// Download file
router.get("/:filename", async (req, res) => {
  try {
    console.log("file get");
    const filename = req.params.filename;
    let downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.on("data", (data) => res.status(200).write(data));
    downloadStream.on("end", () => res.end());
    downloadStream.on("error", () =>
      res.status(404).json({ message: `${filename} does not exist` })
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete file
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await bucket.delete(new ObjectId(id));
    res.status(200).json({ message: "File deleted" });
  } catch (error) {
    console.error("Error:", error);
    res.status(404).json({ message: `ID ${id} does not exist` });
  }
});

module.exports = router;
