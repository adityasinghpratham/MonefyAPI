const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);

var ObjectId = require('mongodb').ObjectID;
const groupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    creationDate: {type: Date, default:Date.now},
    members: [{ type : ObjectId}, 'User'],
    avatarImage: { type: String, required: true },
    balance: [{
        user: { type: ObjectId, ref: 'User'},
        bal : {type: Number}
        }]
    
});

module.exports = mongoose.model('Group', groupSchema);