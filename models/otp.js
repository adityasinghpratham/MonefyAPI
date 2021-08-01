const mongoose = require('mongoose');
const otpSchema = mongoose.Schema({
    email: String,
    code: String,
    expireIn: Number
},{
    timeStamps: true
  });
module.exports = mongoose.model('Otp', otpSchema, 'otp');