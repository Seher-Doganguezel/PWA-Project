const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  image_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PostFile",
  },
  text: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Post", PostSchema);
