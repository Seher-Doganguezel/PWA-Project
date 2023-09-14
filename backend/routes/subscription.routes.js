const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const publicVapidKey = 'BKqjdfy1FfKWsxwnki4wJKOtGZy1JeX-Tb04x0HudiKzStK5k8XTrr2FvuZcjGCE1-1E2SbDE5ZfFL3oCafQqzA';
const privateVapidKey = '6ANS0HTp1nwzyg64mQhbKXKKiWt02HHIHCI1sNVbBIw';

router.post('/', async(req, res) => {
    const subscription = req.body;
    console.log('subscription', subscription);
    res.status(201).json({ message: 'subscription received'});

    webpush.setVapidDetails('mailto:Seher.Doganguezel@htw-berlin.de', publicVapidKey, privateVapidKey);
});

module.exports = router;