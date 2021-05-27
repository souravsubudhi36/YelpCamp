var mongoose = require('mongoose');
var campschema = new mongoose.Schema({
    name:String,
    date: {
      type: Date,
      default : Date.now
    },
    address: {
      type: String,
      default : "Yellowstone, USA"
    },
    location : {
      type : {
        lat : Number,
        lng : Number
      },
      default: {
        lat : 44.4280,
        lng : -110.5885
      }
    },
    url:String,
    supportingimages : [String],
    description:String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }],
    creator : {

            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'


    },
    username : String
});

module.exports = mongoose.model('Camp',campschema);
