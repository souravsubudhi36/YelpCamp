var mongoose = require('mongoose'),
    pp = require('passport-local-mongoose');

var schema = new mongoose.Schema({
    username: String,
    password: String,
    dp : {
        default : "/profile.jpg",
        type : String
    },
    cover : {
      default : '/profilecover.jpg',
      type: String
    },
    address : {
      default : 'Earth, Milky Way',
      type: String
    },
    likes : {
        default : 0,
        type : Number
    },
    description : String,
    liked : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
        ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
        ]
});

schema.plugin(pp);

module.exports = mongoose.model('user',schema);
