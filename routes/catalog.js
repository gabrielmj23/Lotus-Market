var express = require('express');
var router = express.Router();

// Require controllers
var item_controller = require('../controllers/itemController');
var category_controller = require('../controllers/categoryController');

// ITEM ROUTES //

// GET home page
router.get('/', item_controller.index);

// GET item list
router.get('/items', item_controller.item_list);

// GET request for item creation
router.get('/item/create', item_controller.item_create_get);

// POST request for item creation
router.post('/item/create', item_controller.item_create_post);

// GET item's detail page
router.get('/item/:id', item_controller.item_detail);

// GET request for item deletion
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request for item deletion
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request for item update
router.get('/item/:id/update', item_controller.item_update_get);

// POST request for item update
router.post('/item/:id/update', item_controller.item_update_post);


// CATEGORY ROUTES //

// GET category list
router.get('/categories', category_controller.category_list);

// GET request for category creation
router.get('/category/create', category_controller.category_create_get);

// POST request for category creation
router.post('/category/create', category_controller.category_create_post);

// GET category's details
router.get('/category/:id', category_controller.category_detail);

// GET request for category deletion
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request for category deletion
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request for category update
router.get('/category/:id/update', category_controller.category_update_get);

// POST request for category update
router.post('/category/:id/update', category_controller.category_update_post);

module.exports = router;