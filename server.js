
const sanitizeHtml = require('sanitize-html');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const express = require('express');
const app = express();
const path = require('path');
const storeService = require('./store-service');
const sequelize = require('./models/db');
const Category = require('./models/Category');
const Item = require('./models/Item');


sequelize.sync()
    .then(() => console.log('Database synced successfully'))
    .catch(err => console.error('Error syncing database:', err));



function sanitize(content) {
    return sanitizeHtml(content, {
        allowedTags: [],
        allowedAttributes: {}
    });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

cloudinary.config({
    cloud_name: "dochsjc0c",
    api_key: "138148657769567",
    api_secret: "b7xZv1vHyXnZVbqYeeo13SLqrw",
    secure: true
});

const upload = multer();

app.use((req, res, next) => {
    res.locals.activeRoute = req.path;
    next();
});

app.use(express.static('public'));
const HTTP_PORT = process.env.PORT || 8080;

storeService.initialize()
    .then(() => {
        app.get('/', (req, res) => {
            res.redirect('/about');
        });

        app.get('/about', (req, res) => {
            res.render('about', { pageTitle: 'About' });
        });

        app.get('/items/add', (req, res) => {
            const categories = [
                { id: 1, name: "Home, Garden" },
                { id: 2, name: "Electronics, Computers, Video Games" },
                { id: 3, name: "Clothing" },
                { id: 4, name: "Sports & Outdoors" },
                { id: 5, name: "Pets" }
            ];
            res.render('addItem', { categories, pageTitle: 'Add Item' });
        });

        app.get('/shop', (req, res) => {
            Promise.all([
                storeService.getPublishedItems(),
                storeService.getCategories()
            ])
                .then(([items, categories]) => {
                    res.render('shop', { items, categories, pageTitle: 'Shop' });
                })
                .catch(err => {
                    res.render('shop', { items: [], categories: [], pageTitle: 'Shop', message: "Error loading items or categories." });
                });
        });

        app.get('/items', (req, res) => {
            const category = req.query.category;

            storeService.getCategories()
                .then(categories => {
                    const fetchItems = category
                        ? storeService.getPublishedItemsByCategory(category)
                        : storeService.getPublishedItems();

                    return fetchItems.then(items => {
                        res.render('items', {
                            items: items,
                            categories: categories,
                            message: items.length > 0 ? "" : "No items found",
                            selectedCategory: category || null,
                            pageTitle: 'Items'
                        });
                    });
                })
                .catch(err => {
                    res.render('items', {
                        items: [],
                        categories: [],
                        message: "Error loading items",
                        selectedCategory: null,
                        pageTitle: 'Items'
                    });
                });
        });


        app.get('/item/:value', (req, res) => {
            storeService.getItemById(req.params.value)
                .then(item => res.json(item))
                .catch(err => res.status(404).json({ message: err }));
        });

        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then((categories) => {
                    res.render('categories', {
                        categories: categories,
                        message: categories.length > 0 ? "" : "No categories found",
                        pageTitle: 'Categories'
                    });
                })
                .catch((err) => {
                    res.render('categories', {
                        categories: [],
                        message: "Error loading categories",
                        pageTitle: 'Categories'
                    });
                });
        });


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

        app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
        });

        app.listen(HTTP_PORT, () => console.log(`Server listening on: ${HTTP_PORT}`));
    })
    .catch(err => {
        console.log(`Failed to initialize store-service: ${err}`);
    });
