//same upload file
//const collectionFiles = connect.collection('posts.files');


function getOnePost(id) {
    return new Promise( async(resolve, reject) => {
        try {
            const post = await Post.findOne({ _id: id });
            console.log('post.image_id', post.image_id);
            let fileName = post.image_id;

            collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
                console.log('docs', docs)

                collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray( (err, chunks) => {


                    const fileData = [];
                    for(let chunk of chunks)
                    {
                        // console.log('chunk._id', chunk._id)
                        fileData.push(chunk.data.toString('base64'));
                    }

                    let base64file = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
                    let getPost = new Post({
                        "title": post.title,
                        "location": post.location,
                        "image_id": base64file,
                        "text": post.text,
                        "_id": post._id
                    });
                    //console.log('getPost', getPost)
                    resolve(getPost)
                })

            }) // toArray find filename

        } catch {
            reject(new Error("Post does not exist!"));
        }
    })
} 


// POST one post
 /* router.post('/', upload.single('file'), async(req, res) => {
    // req.file is the `file` file  
    console.log('req.body', req.body);
    if (req.file === undefined) {
        return res.send({
            "message": "no file selected"
        });
    } else {
        console.log('req.body', req.body);
        const newPost = new Post({
            title: req.body.title,
            location: req.body.location,
            image_id: req.file.filename,
            text: req.body.text
        })
        await newPost.save();
        sendNotification();
        // console.log("Returning new post:", newPost);
        return res.send(newPost);
    }
})  */
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
            console.log('sendAllPosts', sendAllPosts)
            resolve(sendAllPosts)
        } catch {
                reject(new Error("Posts do not exist!"));
    }
    });
}
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
