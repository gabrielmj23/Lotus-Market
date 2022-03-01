var Item =  require('../models/item');
var Category = require('../models/category');
var async = require('async');
const { body, validationResult } = require('express-validator');

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
    Category.find({}, 'name')
    .sort({name: 1})
    .exec(function(err, results) {
        if (err) { return err; }
        // Render item creation form with list of categories
        res.render('item_form', {title: 'Lotus Market | Create Item', categories: results});
    });
};

// Handle item creation
exports.item_create_post = [
    // Validate and sanitize input
    body('name').trim().isLength({min: 1}).withMessage('Name must not be empty.').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Name must be alphanumeric.').escape(),
    body('description').trim().isLength({min: 1}).withMessage('Description must not be empty.').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Description must be alphanumeric.').escape(),
    body('category').escape(),
    body('price', 'Price must be greater than 0.').isFloat({min: 0.01}),
    body('in_stock', 'Amount in stock must be a non-negative integer.').isInt({min: 0}),
    body('exp_date', 'Invalid date.').optional({checkFalsy: true}).isISO8601().toDate(),

    // Process request
    (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create new item
        var item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            in_stock: req.body.in_stock,
            exp_date: req.body.exp_date
        });

        if (!errors.isEmpty()) {
            // There are errors. Get categories for rendering
            Category.find({}, 'name')
            .sort({name: 1})
            .exec(function(err, results) {
                if (err) { return next(err); }
                // Render with error messages
                res.render('item_form', {title: 'Lotus Market | Create Item', categories: results, item: item, errors: errors.array()});
            });
            return;
        }
        else {
            // Save valid item
            item.save(function(err) {
                if (err) { return next(err); }
                res.redirect(item.url);
            });
        }
    }
];

// Display item deletion form
exports.item_delete_get = function(req, res, next) {
    Item.findById(req.params.id, 'name description')
    .exec(function(err, results) {
        if (err) { return next(err); }
        // No results
        if (results == null) {
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Render page with basic item info
        res.render('item_delete', {title: 'Lotus Market | Delete Item', item: results});
    });
};

// Handle item deletion
exports.item_delete_post = function(req, res, next) {
    Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) { return next(err); }
        // Success, redirect to item list
        res.redirect('/catalog/items');
    });
};

// Display item update form
exports.item_update_get = function(req, res, next) {
    // Get item info and available categories
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).exec(callback);
        },
        categories: function(callback) {
            Category.find({}, 'name').sort({name: 1}).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Item not found
        if (results.item == null) {
            var err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        // Render page with info
        res.render('item_form', {title: 'Lotus Market | Update Item', item: results.item, categories: results.categories});
    });
};

// Handle item update
exports.item_update_post = [
    // Validate and sanitize
    body('name').trim().isLength({min: 1}).withMessage('Name must not be empty.').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Name must be alphanumeric.').escape(),
    body('description').trim().isLength({min: 1}).withMessage('Description must not be empty.').isAlphanumeric('en-US', {ignore: '\s'}).withMessage('Description must be alphanumeric.').escape(),
    body('category').escape(),
    body('price', 'Price must be greater than 0.').isFloat({min: 0.01}),
    body('in_stock', 'Amount in stock must be a non-negative integer.').isInt({min: 0}),
    body('exp_date', 'Invalid date.').optional({checkFalsy: true}).isISO8601().toDate(),

    // Process request
    (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create new item object
        var item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            in_stock: req.body.in_stock,
            exp_date: req.body.exp_date,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors. Find list of categories before rendering
            Category.find({}, 'name').sort({name: 1})
            .exec(function(err, results) {
                if (err) { return next(err); }
                res.render('item_form', {title: 'Lotus Market | Update Item', item: item, categories: results, errors: errors.array()});
            });
            return;
        }
        else {
            // Update item
            Item.findByIdAndUpdate(req.params.id, item, {}, function(err, newItem) {
                if (err) { return next(err); }
                // Successful, redirect to new item page
                res.redirect(newItem.url);
            });
        }
    }
];