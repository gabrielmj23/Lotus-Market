var mongoose = require('mongoose');
const { DateTime } = require('luxon');

var Schema = mongoose.Schema;

// TODO: Store optional image
var ItemSchema = new Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
        price: {type: Number, min: 0.01, required: true},
        in_stock: {type: Number, min: 0, required: true},
        exp_date: {type: Date}
    }
);

// Virtual for item's URL
ItemSchema.virtual('url').get(function() {
    return '/catalog/item/' + this._id;
});

ItemSchema.virtual('exp_date_formatted').get(function() {
    return DateTime.fromJSDate(this.exp_date).toLocaleString(DateTime.DATE_MED);
});

// Export model
module.exports = mongoose.model('Item', ItemSchema);