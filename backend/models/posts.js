const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: String,
    
})

module.exports = mongoose.model('Post', schema);

//location: String,
  //  image_id: String,
   // txt: String