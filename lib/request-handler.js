var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Promise = require('bluebird');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find()
    .then(function (links) {
      if (err) {
        res.sendStatus(500);
      } else {
        res.status(200).send(links);
      }
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  // find the url in the database
    // if found, sent it as the response
    // else, create a new one

  Link.findOne({url: uri})
    .then(function (link) {
      // console.log('flag1');
      if (link !== null) {
        // console.log('flag2', link);
        res.status(200).send(link);
      } else {
        // console.log('flag3');
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }

          var newLink = new Link({
            url: uri,
            title: title,
            baseUrl: req.headers.origin,
            visits: 0
          });

          newLink.save()
            .then(function (savedLink) {
              // console.log('flag4');
              res.status(200).send(savedLink);
            })
            .catch(function (err) {
              console.error(err);
              res.sendStatus(500);
            });
        });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.status(200).send(found.attributes);
  //   } else {
  //         //todo: refactor

  //       var newLink = new Link({
  //         url: uri,
  //         title: title,
  //         baseUrl: req.headers.origin
  //       });
  //       newLink.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.status(200).send(newLink);
  //       });
  //     });
  //   }
  // });
};


exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var comparePassword = function(attemptedPassword, curPassword, callback) {
    bcrypt.compare(attemptedPassword, curPassword, function(err, isMatch) {
      callback(isMatch);
    });
  };

  //find user 
  var startTime1 = Date.now();
  User.findOne({ username: username })
    .then(function (user) {
      var endTime1 = Date.now();
      var elapsedTime1 = endTime1 - startTime1;
      console.log('found user in', elapsedTime1);
      if (user !== null) {
        //compare given password to known password
        var startTime2 = Date.now();
        comparePassword(req.body.password, user.password, function (match) {
          var endTime2 = Date.now();
          var elapsedTime2 = endTime2 - startTime2;
          console.log('compared password in', elapsedTime2);
          // if they are the same, 
          if (match) {
            //create session
            console.log('option1');
            return util.createSession(req, res, user);
          } else {
            //else redirect to login
            console.log('option2');
            return res.redirect('/login');
          }
        });
      } else {
        // else, redirect to login
        console.log('option3');
        return res.redirect('/login');
      }
    })
    .catch(function (err) {
      console.error(err);
      return res.sendStatus(500);
    });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
    .then(function (user) {
      // if they exist
      if (user !== null) {
        // redirect to signup
        res.redirect('/signup');
      } else {
        // create new User with provided username and password
        var newUser = new User({
          username: username,
          password: password,
        }).save(function (err, savedUser) {
          if (err) {
            console.error(err);
          } else {
          console.log('savedUser')
            util.createSession(req, res, savedUser);
          }
        });

        // create session for new user
      }
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });




  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //         //todo: refactor

  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           Users.add(newUser);
  //           util.createSession(req, res, newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   });
};

exports.navToLink = function(req, res) {
  //todo: refactor

  // find link
    // if exists
    // else
      // redirect to home page

  Link.findOne({ code: req.params[0] })
    .then(function (link) {
      console.log(link);
      console.log(req.params[0]);
      if (link) {
        // update link with +1 visit
        link.visits++;

        link.save(function (err, updatedLink) {
          if (err) {
            res.sendStatus(500);
          } else {
            // redirect to that link
            res.redirect(link.url);
          }
        });
      } else {
        res.redirect('/');
      }
    })
    .catch(function (err) {
      console.error(err);
      res.sendStatus(500);
    });




  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};





















