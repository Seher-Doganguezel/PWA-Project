const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');



// POST one post
router.post('/', upload.single('file'), async(req, res) => {
    // req.file is the `file` file
    if (req.file === undefined) {
        return res.send({
            "message": "no file selected"
        });
    } else {

        console.log('req.file', req.file);
        const imgUrl = `http://localhost:8000/upload/${req.file.filename}`;
        return res.status(201).send({
            url: imgUrl
        });
    }
})

module.exports = router;
