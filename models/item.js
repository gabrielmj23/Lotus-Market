var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// TODO: Store optional image
var ItemSchema = new Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
        price: {type: Number, min: 0.01, required: true},
        in_stock: {type: Number, min: 0, required: true}
    }
);

// Virtual for item's URL
ItemSchema.virtual('url').get(function() {
    return '/catalog/item/' + this._id;
});

// Export model
module.exports = mongoose.model('Item', ItemSchema);