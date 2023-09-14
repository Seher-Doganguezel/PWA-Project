const express = require('express');
const router = express.Router();
const Post = require('../models/posts')
const upload = require('../middleware/upload')
const mongoose = require('mongoose')
require('dotenv').config()

const webpush = require('web-push');

const publicVapidKey = 'BKqjdfy1FfKWsxwnki4wJKOtGZy1JeX-Tb04x0HudiKzStK5k8XTrr2FvuZcjGCE1-1E2SbDE5ZfFL3oCafQqzA';
const privateVapidKey = '6ANS0HTp1nwzyg64mQhbKXKKiWt02HHIHCI1sNVbBIw';
const pushSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/cMdUtRW4H9o:APA91bG8p3o-Ta31e1yMrqdvonJCyf3xbPfIFtpS2UbX9PcJwkeNKoQjZhEAWo5nad7eR3NgRQR8__3wk591j7DKWJLGzwWgJYm_GgipU0gTvMRpWA6TpmCtrD9OCo1mB0jZQrTj5a_5',
    keys: {
        auth: 'fJRvyO_fnPXsYeDkMy_jAA',
        p256dh: 'BDhH_TBG4l-PU3wJnT6wHqsPeYusbPqOiw7VvJvupXDC3JZOIIOiz2Ml8ZaZD9wJuGnXs9BFqINEzrFStsjkk6c',
    }
};

function sendNotification() {
    webpush.setVapidDetails('mailto:s0577720@htw-berlin.de', publicVapidKey, privateVapidKey);
    const payload = JSON.stringify({
        title: 'New Push Notification',
        content: 'New data in database!',
        openUrl: '/'
    });
    webpush.sendNotification(pushSubscription,payload)
        .catch(err => console.error(err));
    console.log('push notification sent');
    // res.status(201).json({ message: 'push notification sent'});
}

// _________________Posts______________________________-

// POST one post
router.post('/', upload.single('file'), async(req, res) => {
    if(req.file === undefined)
    {
        return res.send({
            "message": "no file selected"
        })
    } else {
        const newPost = new Post({
            title: req.body.title,
            location: req.body.location,
            image_id: req.file.filename,
           
        })
        await newPost.save();
        sendNotification();
        return res.send(newPost);
    }
})

// _________________ GET ___________________

const connect = mongoose.createConnection(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const collectionFiles = connect.collection('posts.files');
const collectionChunks = connect.collection('posts.chunks');

function getOnePost(id) {
    return new Promise( async(resolve, reject) => {
        try {
            const post = await Post.findOne({ _id: id });
            let fileName = post.image_id;

            collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {

                // sort({n: 1}) --> die chunks nach Eigenschaft n aufsteigend sortieren
                collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray( (err, chunks) => {
                    
                    const fileData = [];
                    for(let chunk of chunks)
                    {
                        // console.log('chunk._id', chunk._id)
                        fileData.push(chunk.data.toString('base64'));
                    }

                    let base64file = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
                    let getPost = new Post({
                        "_id": post._id,
                        "title": post.title,
                        "location": post.location, 
                        "image_id": base64file,
                        
                    });

                    resolve(getPost)
                })

            }) 

        } catch {
            reject(new Error("Post does not exist!"));
        }
    })
}

function getAllPosts() {
    return new Promise( async(resolve, reject) => {
        const sendAllPosts = [];
        const allPosts = await Post.find();
        try {
            for(const post of allPosts) {
                console.log('post', post)
                const onePost = await getOnePost(post._id);
                sendAllPosts.push(onePost);
            }
            
            resolve(sendAllPosts)
        } catch {
                reject(new Error("Posts do not exist!"));
        }
    });
}

// GET one post via id
router.get('/:id', async(req, res) => {
    getOnePost(req.params.id)
    .then( (post) => {
        console.log('post', post);
        res.send(post);
    })
    .catch( () => {
        res.status(404);
        res.send({
            error: "Post does not exist!"
        });
    })
});

// GET all posts
router.get('/', async(req, res) => {
    
    getAllPosts()
    .then( (posts) => {
        res.send(posts);
    })
    .catch( () => {
        res.status(404);
        res.send({
            error: "Post do not exist!"
        });
    })
});


// _______________________DELETE _______________________________

// DELETE one post via id
router.delete('/:id', async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })
        let fileName = post.image_id;
        await Post.deleteOne({ _id: req.params.id });
        await collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
            await collectionChunks.deleteMany({files_id : docs[0]._id});
        })
        await collectionFiles.deleteOne({filename: fileName});
        res.status(204).send()
    } catch {
        res.status(404)
        res.send({ error: "Post does not exist!" })
    }
});

module.exports = router;