const fs = require('fs');
const path = require('path');

let items = [];
let categories = {};

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, './data/items.json'), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read items.json");
                return;
            }
            items = JSON.parse(data);

            fs.readFile(path.join(__dirname, './data/categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read categories.json");
                    return;
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(items);
        }
    })
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        let publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length == 0) {
            reject('no results returned');
        }
        resolve(publishedItems);
    })
 
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(categories);
        }
    })

}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };
