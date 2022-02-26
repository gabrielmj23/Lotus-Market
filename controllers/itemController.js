var Item =  require('../models/item');

// Display home page
exports.index = function(req, res, next) {
    res.render('index', {title: 'Lotus Market'});
};

// Display list of items
exports.item_list = function(req, res, next) {

};

// Display item's details
exports.item_detail = function(req, res, next) {

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