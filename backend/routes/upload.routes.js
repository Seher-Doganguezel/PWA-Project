const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
let gfs;
const mongodb = require('mongodb')


// POST one post
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file selected" });
    }

    const imgUrl = `http://localhost:8000/upload/${req.file.filename}`;
    res.status(201).send({ url: imgUrl });
});


let bucket;
mongoose.connection.once('open', () => {
    const database = mongoose.connection.db;
    gfs = Grid(database, mongoose.mongo);
    gfs.collection('uploads');
    bucket = new mongodb.GridFSBucket(database, {
        bucketName: 'uploads'
    });
});


router.get('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        let downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.on("data", (data) => res.status(200).write(data));
        downloadStream.on("error", (err) => res.status(404).send({ message: filename + " does not exist" }));
        downloadStream.on("end", () => res.end());
    } catch (error) {
        console.log('error', error);
        res.send("not found");
    }
});

const ObjectId = mongodb.ObjectId
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await bucket.delete(new ObjectId(id));
        res.status(200).send({ message: "deleted" })
    } catch (error) {
        console.log('error', error);
        res.status(404).send({ message: "id " + id + " does not exist" });
    }
});

// postX --> Bilder anhängen
//POST REPRÄSENTATION
/* {
    postName: "Wie backt man Kuchen"
    imageID: 1
}
FILE REPRÄSENTATION
{
    fileId: asdasd
    id: asdasdas
    file_name: 1
} */



module.exports = router;
