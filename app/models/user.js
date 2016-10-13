var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

// var db = require('../config');

// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function() {
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function() {
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });

// module.exports = User;


var mongoose = require('mongoose');
// TODO: replicate the functionality of initialize();

var userSchema = new mongoose.Schema({
  username: String, 
  password: String,
}, { collection: 'users' });

userSchema.pre('save', function (next) {
  // var startTime = Date.now();
  // var cipher = Promise.promisify(bcrypt.hash);
  // return cipher(this.password, null, null).bind(this)
  //   .then(function(hash) {
  //     this.password = hash;
  //     var endTime = Date.now();
  //     var elapsedTime = endTime - startTime;
  //     console.log('hashed password in', elapsedTime);
  //     next();
  //   });

  var startTime = Date.now();
  var cipher = bcrypt.hash;
  return cipher(this.password, null, null, (err, hash) => {
    if (err) {
      console.error(err);
      return next();
    }

    var endTime = Date.now();
    var elapsedTime = endTime - startTime;
    console.log('hashed password in', elapsedTime);
    this.password = hash;
    next();
  });

});

module.exports = mongoose.model('User', userSchema);