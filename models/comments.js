var mongoose = require('mongoose');

var schema = mongoose.Schema({
    text: String,
    date: {
      type: Date,
      default : Date.now
    },
    author : {
        id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        username : String,
        dp : String
    },
    parentt : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'comment'
        }
    }
});

module.exports = mongoose.model('comment', schema);
