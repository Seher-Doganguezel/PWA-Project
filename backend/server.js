const express = require('express');
const mongoose = require('mongoose');
const uploadRoutes = require('./routes/upload.routes');
const postRoutes = require('./routes/post.routes');
require('dotenv').config();
const cors = require('cors')
const app = express(); 
const PORT = 8000;

app.use(express.json());
app.use(cors());
app.use('/upload', uploadRoutes);
app.use('/posts', postRoutes);


// connect to mongoDB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
   console.log('connected to DB');
});

//mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
//.then(
 //   () => console.log('connected to DB')
//).catch(
 //   err => console.error(err, 'conncetion error')
//)
//

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});
