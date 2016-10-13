
// var db = require('../config');
var crypto = require('crypto');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

// module.exports = Link;





var mongoose = require('mongoose');
// TODO: replicate the functionality of initialize();

var linkSchema = new mongoose.Schema({
  url: String, 
  baseUrl: String,
  code: String, 
  title: String,
  visits: Number
}, { collection: 'urls' });

linkSchema.pre('save', function (next) {
  var shasum = crypto.createHash('sha1');
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

module.exports = mongoose.model('Link', linkSchema);