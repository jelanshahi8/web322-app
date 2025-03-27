const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

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
                resolve(); // Moved here to ensure categories are loaded
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length == 0) {
            reject('no results returned');
        } else {
            resolve(items);
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        let publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length == 0) {
            reject('no results returned');
        }
        resolve(publishedItems);
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject('no results returned');
        } else {
            resolve(categories);
        }
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        if (itemData.published === undefined) {
            itemData.published = false;
        }
        itemData.id = items.length + 1;
        items.push(itemData);

        fs.writeFile(path.join(__dirname, './data/items.json'), JSON.stringify(items, null, 2), 'utf8', (err) => {
            if (err) {
                reject('Failed to save item to file');
                return;
            }
            resolve(itemData);
        });
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        if (filteredItems.length === 0) {
            reject('no results returned');
        } else {
            resolve(filteredItems);
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        if (isNaN(minDate.getTime())) {
            reject('Invalid date format');
        }
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        if (filteredItems.length === 0) {
            reject('no results returned');
        } else {
            resolve(filteredItems);
        }
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        if (!item) {
            reject('no result returned');
        } else {
            resolve(item);
        }
    });
}

function getPublishedItemsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.category == categoryId && item.published);
        if (publishedItems.length === 0) {
            reject('no results returned');
        } else {
            resolve(publishedItems);
        }
    });
}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories, addItem, getItemsByCategory, getItemsByMinDate, getItemById, getPublishedItemsByCategory };
