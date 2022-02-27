var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');

// Display list of categories
exports.category_list = function(req, res, next) {
    Category.find({}, 'name')
    .sort({name: 1})
    .exec(function(err, results) {
        if (err) { return next(err); }
        // Render category list
        res.render('category_list', {title: 'Lotus Market | Categories', category_list: results});
    });
};

// Display category's details
exports.category_detail = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
        category_items: function(callback) {
            Item.find({'category': req.params.id}).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Category not found
        if (results.category == null) {
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Render with category data and items from this category
        res.render('category_detail', {title: 'Lotus Market | ' + results.category.name, category: results.category, items: results.category_items});
    });
};

// Display category creation form
exports.category_create_get = function(req, res, next) {

};

// Handle category creation
exports.category_create_post = function(req, res, next) {

};

// Display category deletion form
exports.category_delete_get = function(req, res, next) {

};

// Handle category deletion
exports.category_delete_post = function(req, res, next) {

};

// Display category update form
exports.category_update_get = function(req, res, next) {

};

// Handle category update
exports.category_update_post = function(req, res, next) {

};