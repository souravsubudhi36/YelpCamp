var mongoose = require('mongoose'); //deprecated

var schema = mongoose.Schema({
    text: String,
    author : {
        id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        username : String
    },
    parent : {
        id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }
    }
});

module.exports = mongoose.model('subcomment', schema);