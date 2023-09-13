const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  image_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PostFile",
  },
  txt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);
