
 const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require('path');
const storeservice = require(__dirname + "/store-service.js");

onHttpStart = () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

 
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});


app.get("/shop", (req, res) => {
    storeservice.getPublishedItems().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.status(404).json({message: err});
    })
});

app.get("/items", (req, res) => {
    storeservice.getAllItems().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.status(404).json({message: err});
    })
});

app.get("/categories", (req, res) => {
    dataservice.getDepartments().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.status(404).json({message: err});
    })
});

app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});

dataservice.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log('promises unfulfilled');
});
