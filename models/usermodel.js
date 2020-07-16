const mongoose = require('mongoose');

const Users = mongoose.Schema({
  
    empid: 
    {
     type:Number,
     unique: true
    },
    ename: String,
    email: String,
    password: String,
    role: String
});


module.exports = mongoose.model('User', Users);