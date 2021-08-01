const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: mongoose.Schema.Types.Mixed, },
    firstName: { type: mongoose.Schema.Types.Mixed, },
    lastName: { type: mongoose.Schema.Types.Mixed,  },
    avatarImage: { type: mongoose.Schema.Types.Mixed, },
    extra : {}  
    }, {strict: false});
module.exports = mongoose.model('User', userSchema);