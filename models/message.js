const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);

var ObjectId = require('mongodb').ObjectID;
const gmessageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    note: {type: String, required: true},
    from: { type: ObjectId, ref: 'User'},
    to: { type: ObjectId, ref: 'User'},
    expense: {type: Float, },
    dateCreated: {type: Date, default:Date.now},
    split: { type: ObjectId, ref: 'User'},
    acceptedSplits: { type: ObjectId, ref: 'User'},
    declinedSplits: { type: ObjectId, ref: 'User'},
    splitAmount: [{
        user: { type: ObjectId, ref: 'User'},
        bal : {type: Number}
        }]
});

module.exports = mongoose.model('Message', messageSchema);