const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const path = require('path');
const storeService = require('./store-service');

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

        app.get('/shop', (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('/items', (req, res) => {
            storeService.getAllItems()
                .then(data => res.json(data))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))
                .catch(err => res.status(404).json({ message: err }));
        });

        // 404 Route
        app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
        });

        // Start the server
        module.exports = app; 
    })
    .catch(err => {
        console.log(`Failed to initialize store-service: ${err}`);
    });
