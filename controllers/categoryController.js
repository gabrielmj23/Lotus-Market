var Category = require('../models/category');
var Item = require('../models/item');
var async = require('async');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

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
    body('name').trim().isLength({min: 1}).withMessage('Name must not be empty.').isLength({max: 50}).withMessage('Name must be no longer than 50 characters').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Name must be alphanumeric.').escape(),
    body('description').trim().isLength({min: 1}).withMessage('Description must not be empty').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Description must be alphanumeric.').escape(),

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
    // Find category info and items with this category
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
        items: function(callback) {
            Item.find({'category': req.params.id}).sort({name: 1}).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Category not found
        if (results.category == null) {
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Render with needed data
        res.render('category_delete', {title: 'Lotus Market | Delete Category', category: results.category, items: results.items});
    });
};

// Handle category deletion
exports.category_delete_post = [
    // Validate admin password
    body('pw').isLength({min: 1}).withMessage('Admin password is required.').custom(pw => {
        if (pw !== process.env.ADMIN_PW) {
            throw new Error('Password is incorrect');
        }
        return true;
    }),

    // Process request
    (req, res, next) => {
        // Get validation errors
        const errors = validationResult(req);

        // Find category info and items under this category
        async.parallel({
            category: function(callback) {
                Category.findById(req.body.categoryid).exec(callback);
            },
            items: function(callback) {
                Item.find({'category': req.body.categoryid}).sort({name: 1}).exec(callback);
            }
        }, function(err, results) {
            if (err) { return next(err); }
            // Success
            if (results.items.length > 0) {
                // There are items left to delete
                res.render('category_delete', {title: 'Lotus Market | Delete Category', category: results.category, items: results.items});
                return;
            }
            else if (!errors.isEmpty()) {
                // Incorrect password
                res.render('category_delete', {title: 'Lotus Market | Delete Category', category: results.category, items: results.items, errors: errors.array()});
                return;
            }
            else {
                // Can delete with no issues
                Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                    if (err) { return next(err); }
                    // Success, redirect to category list
                    res.redirect('/catalog/categories');
                });
            }
        });
    }
];

// Display category update form
exports.category_update_get = function(req, res, next) {
    // Get category data
    Category.findById(req.params.id)
    .exec(function(err, results) {
        if (err) { return next(err); }
        // Category not found
        if (results == null) {
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Render page with category data
        res.render('category_form', {title: 'Lotus Market | Update Category', category: results, danger: true});
    });
};

// Handle category update
exports.category_update_post = [
    // Validate and sanitize
    body('name').trim().isLength({min: 1}).withMessage('Name must not be empty.').isLength({max: 50}).withMessage('Name must be no longer than 50 characters').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Name must be alphanumeric.').escape(),
    body('description').trim().isLength({min: 1}).withMessage('Description must not be empty').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Description must be alphanumeric.').escape(),

    // Validate admin password
    body('pw').isLength({min: 1}).withMessage('Admin password is required.').custom(pw => {
        if (pw !== process.env.ADMIN_PW) {
            throw new Error('Password is incorrect');
        }
        return true;
    }),

    // Process request
    (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create new category object
        var category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors, render page with error messages
            res.render('category_form', {title: 'Lotus Market | Update Category', category: category, danger: true, errors: errors.array()});
            return;
        }
        else {
            // Update category
            Category.findByIdAndUpdate(req.params.id, category, {}, function(err, newCategory) {
                if (err) { return next(err); }
                // Successful, redirect to updated category
                res.redirect(newCategory.url);
            });
        }
    }
];