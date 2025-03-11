/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: jelan shahi
Student ID: 171378235
Date: 2025-02-16
Vercel Web App URL: https://web322-app-eight-tau.vercel.app/about
GitHub Repository URL: https://github.com/jelanshahi8/web322-app

********************************************************************************/



const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const path = require('path');
const storeService = require('./store-service');

cloudinary.config({
    cloud_name: "dochsjc0c",
    api_key: "138148657769567",
    api_secret: "b7xZv1vHyXnZVZbqYeeo13SLqrw",
    secure: true
});

const upload = multer(); 

app.use(express.static('public'));
const HTTP_PORT = process.env.PORT || 8080; // assign a port

// Initialize store-service before starting the server
storeService.initialize()
    .then(() => {
        // Define Routes
        app.get('/', (req, res) => {
            res.redirect('/about');
        });

        app.get('/about', (req, res) => {
            res.sendFile(path.join(__dirname, '/views/about.html'));
        });

        app.get('/items/add', (req, res) => {
            res.sendFile(path.join(__dirname, '/views/addItem.html'));
        });

        app.get('/shop', (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('/items', (req, res) => {
            if (req.query.category && req.query.minDate) {
                return res.status(400).json({ error: "Cannot filter by both category and minDate simultaneously" });
            }

            if (req.query.category) {
                storeService.getItemsByCategory(req.query.category)
                    .then(data => res.json(data))
                    .catch(err => res.status(404).json({ message: err }));
            }
            else if (req.query.minDate) {
                storeService.getItemsByMinDate(req.query.minDate)
                    .then(data => res.json(data))
                    .catch(err => res.status(404).json({ message: err }));
            }
            else {
                storeService.getAllItems()
                    .then(data => res.json(data))
                    .catch(err => res.status(404).json({ message: err }));
            }
        });

        app.get('/item/:value', (req, res) => {
            storeService.getItemById(req.params.value)
                .then(item => res.json(item))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))
                .catch(err => res.status(404).json({ message: err }));
        });

        // POST route to handle item addition
        app.post('/items/add', upload.single("featureImage"), (req, res) => {
            if (req.file) {
                let streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        let stream = cloudinary.uploader.upload_stream(
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };

                async function upload(req) {
                    let result = await streamUpload(req);
                    console.log(result);
                    return result;
                }

                upload(req).then((uploaded) => {
                    processItem(uploaded.url);
                }).catch((err) => {
                    console.error("Cloudinary Upload Error:", err);
                    processItem("");
                });
            } else {
                processItem("");
            }

            function processItem(imageUrl) {
                req.body.featureImage = imageUrl;

                storeService.addItem(req.body)
                    .then(() => res.redirect('/items'))
                    .catch(err => res.status(500).json({ error: err }));
            }
        });

        // 404 Route
        app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
        });

        // Start the server
        app.listen(HTTP_PORT, () => console.log(`Server listening on: ${HTTP_PORT}`));
    })
    .catch(err => {
        console.log(`Failed to initialize store-service: ${err}`);
    });

