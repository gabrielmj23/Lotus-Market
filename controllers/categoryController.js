var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const { body, validationResult } = require('express-validator');

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
    res.render('category_form', {title: 'Lotus Market | Create Category'});
};

// Handle category creation
exports.category_create_post = [
    // Validate and sanitize
    body('name').trim().isLength({min: 1}).withMessage('Name must not be empty.').isAlphanumeric().withMessage('Name must be alphanumeric.').escape(),
    body('description').trim().isLength({min: 1}).withMessage('Description must not be empty').isAlphanumeric().withMessage('Description must be alphanumeric.').escape(),

    // Process request
    (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create new category
        var category = new Category({
            name: req.body.name,
            description: req.body.description
        });

        if (!errors.isEmpty()) {
            // Render with error values
            res.render('category_form', {title: 'Lotus Market | Create Category', category: category, errors: errors.array()});
            return;
        }
        else {
            // Save valid category
            category.save(function(err) {
                if (err) { return next(err); }
                res.redirect(category.url);
            });
        }
    }
];

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