const express = require('express');
const postRoutes = require('./routes/post.routes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/posts', postRoutes);

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server running on http://localhost:${PORT}`);
    }
});
