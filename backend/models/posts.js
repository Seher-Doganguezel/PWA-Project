const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: String,
    location: String,
    image_id: String,
    txt: String
})

module.exports = mongoose.model('Post', schema);