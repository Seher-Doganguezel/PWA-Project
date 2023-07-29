const express = require('express');
const mongoose = require('mongoose')
const postRoutes = require('./routes/post.routes');
const uri = 'mongodb+srv://sdoganguezel:<tTnpwNZPPF6qWLDK>@pwa.wbwrvum.mongodb.net/?retryWrites=true&w=majority'
require('dotenv').config();

const app = express();
const PORT = 8000;

app.use(express.json());
app.use('/posts', postRoutes);

 
// connect to mongoDB
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected to DB');
});
 
//

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});
