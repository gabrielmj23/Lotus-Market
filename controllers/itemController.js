var Item =  require('../models/item');
var Category = require('../models/category');
var async = require('async');

// Display home page
exports.index = function(req, res, next) {
    // Get number of categories and items
    async.parallel({
        categories: function(callback) {
            Category.countDocuments({}, callback);
        },
        items: function(callback) {
            Item.countDocuments({}, callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Render home page with results
        res.render('index', {title: 'Lotus Market', categories: results.categories, items: results.items});
    });
};

// Display list of items
exports.item_list = function(req, res, next) {
    Item.find({}, 'name category in_stock')
    .sort({name: 1})
    .populate('category')
    .exec(function(err, results) {
        if (err) { return next(err); }
        // Render item list
        res.render('item_list', {title: 'Lotus Market | Items', item_list: results});
    });
};

// Display item's details
exports.item_detail = function(req, res, next) {
    Item.findById(req.params.id)
    .populate('category')
    .exec(function(err, results) {
        if (err) { return next(err); }
        // Item not found
        if (results == null) {
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Render with item data
        res.render('item_detail', {title: 'Lotus Market | ' + results.name, item: results});
    });
};

// Display item creation form
exports.item_create_get = function(req, res, next) {

};

// Handle item creation
exports.item_create_post = function(req, res, next) {

};

// Display item deletion form
exports.item_delete_get = function(req, res, next) {

};

// Handle item deletion
exports.item_delete_post = function(req, res, next) {

};

// Display item update form
exports.item_update_get = function(req, res, next) {

};

// Handle item update
exports.item_update_post = function(req, res, next) {

};