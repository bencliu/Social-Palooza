"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

//Load session, bodyparser, and multer for processing POST requests
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

//Used for handling photos and POST requests
var express = require('express');
var app = express();
var fs = require("fs");
mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

//Handle post requests: Log-in and registration
app.post('/admin/login', function(req, res) {
  //Store login_name and user_id here
  let loginName = req.body.login_name;
  let password = req.body.password;
  User.findOne({ login_name: loginName }, function(err, user) {
    if (err || (!user)) { //Error in finding user
      res.status(400).send(new Error('Could not find user!'));
      return;
    } else if (user.password !== password) { //Non-matching password
      res.status(400).send(new Error('incorrect password!'));
      return;
    } else {
      req.session.login_name = loginName; //Successful object posting
      req.session.user_id = user._id;
      let object = {'_id':user._id, 'logged_name':user.first_name};
      res.status(200).send(object);
      return;
  }});
});

app.post('/admin/logout', function(req, res) {
  if (!req.session.login_name) { //Undefined
    res.status(400).send(JSON.stringify("No user is currently logged in"));
  } else {
    req.session.destroy();
    res.status(200).send(JSON.stringify("Successfully logged out!"));
  }
});

//Handle photo upload request
app.post('/photos/new', processFormBody, (req, res) => {
  let permissions = [];
  if (JSON.stringify(req.body.body) === "\"undefined\"") {
    permissions = undefined;
  } else {
    permissions = req.body.body.split(',');
  }
  if (!req.session.login_name) { //Undefined
    res.status(400).send(JSON.stringify("No user is currently logged in"));
    return;
  }
  if (!req.file) { //No file
    res.status(400).send(JSON.stringify("No file uploaded!"));
    return;
  }
  let timeStamp = new Date().valueOf();
  console.log(req.file.originalname);
  let fileName = 'U' + String(timeStamp) + req.file.originalname;
  fs.writeFile("./images/" + fileName, req.file.buffer, function(err) {
    if (err) {
      res.status(400).send(JSON.stringify("Error in writing file"));
      return;
    }
    Photo.create({ //Create photo object to add to database
      file_name: fileName,
      date_time: timeStamp,
      user_id: req.session.user_id,
      comments: [],
      permissions: permissions
    }, function(err, newPhoto) {
      if (err) {
        res.status(400).send(JSON.stringify("Error in creating photo"));
        return;
      }
      newPhoto.save(); //Save new photo
      console.log('Created photo object with ID', newPhoto._id);
      let photoObject = { //Send back photo object to front-end
        file_name: fileName,
        date_time: timeStamp,
        user_id: req.session.user_id,
        comments: [],
        id: newPhoto._id
      }
      res.status(200).send(JSON.stringify(photoObject));
    });
  });
});


//Post request for regstration
app.post('/user', function(req, res) {
  let login_name = req.body.login_name;
  if (typeof login_name === undefined) {
    res.status(400).send(JSON.stringify("Invalid login_name!"));
    return;
  }
  console.log(login_name);
  User.findOne( {login_name: login_name }, function(err, user) {
    if (!user) {
      User.create(
        {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            location: req.body.location,
            description: req.body.description,
            occupation: req.body.occupation,
            login_name: req.body.login_name,
            password: req.body.password
        }, function (err, newUser) { //Save new user
            if (err) {
              res.status(400).send(JSON.stringify("Error in creating new user"));
            } else {
              newUser.save();
              console.log("Created object with ID", newUser._id);
              res.status(200).send(JSON.stringify(newUser._id));
            }
        });
    } else {
      res.status(400).send(JSON.stringify("Login_name already exists!"));
    }
  });
});

//Post Requests: Adding comments
app.post('/commentsOfPhoto/:photo_id', function(req, res) {
  if (!req.session.login_name) { //Undefined
    res.status(400).send(JSON.stringify("No user is currently logged in"));
    return;
  }
  if (req.body.comment.length == 0) {
    res.status(400).send(JSON.stringify("No comment entered!"));
    return;
  }
  let photo_id = req.params.photo_id;
  let user_id = req.session.user_id;
  User.findOne( {_id: user_id }, function(err, user) { //Find matching user
    if (err || !user) {
      console.log("Error!");
    } else {
      let userObject = user;
      Photo.findOne( {_id: photo_id }, function(err, photo) { //Find desired photo
        if (err || !photo) {
          console.log(err);
          res.status(400).send(JSON.stringify("Error in finding photo!"));
        } else {
          let commentObject = {
            comment: req.body.comment,
            user_id: userObject._id
          };
          photo.comments.push(commentObject); //Create & save comment object
          photo.save();
          let updatedCommentObject = {
            _id: photo.comments[photo.comments.length - 1]._id,
            comment: req.body.comment,
            user_id: userObject._id,
            photo_id: photo._id,
            user: userObject,
            date_time: Date.now
          }; //Send comment object to front-end
          res.status(200).send(JSON.stringify(updatedCommentObject));
        }
      });
    }
  });
});

//Handler liking photo
app.post('/like/:photo_id', function(req, res) {
  if (!req.session.login_name) { //Undefined
    res.status(400).send(JSON.stringify("No user is currently logged in"));
    return;
  }
  let photoId = req.body.photoId;
  Photo.findOne( {_id: photoId }, function(err, photo) { //Find matching photo
    if (err || !photo) {
      res.status(400).send(JSON.stringify("Error in finding photo!"));
    } else {
      photo.likes += 1; //Add to likes
      photo.userLikes.push(req.session.user_id); //Add user in session
      photo.save();
      let returnObject = {photo: photo, loggedUser: req.session.user_id}; //Return photo and user in session
      res.status(200).send(returnObject);
    }
  });
});

//Handler unliking photo
app.post('/unlike/:photo_id', function(req, res) {
  if (!req.session.login_name) { //Undefined
    res.status(400).send(JSON.stringify("No user is currently logged in"));
    return;
  }
  let photoId = req.body.photoId;
  Photo.findOne( {_id: photoId }, function(err, photo) { //Find matching photo
    if (err || !photo) {
      res.status(400).send(JSON.stringify("Error in finding photo!"));
    } else {
      if (photo.likes > 0) { //Subtract like if within range
        photo.likes -= 1;
      }
      let userLikesCopy = [];
      for (let i = 0; i < photo.userLikes.length; i++) {
        if (photo.userLikes[i] !== req.session.user_id) { //Add to user like list
          userLikesCopy.push(photo.userLikes[i]);
        }
      }
      photo.userLikes = userLikesCopy;
      photo.save(); //Save copy
      let returnObject = {photo: photo, loggedUser: req.session.user_id};
      res.status(200).send(returnObject);
    }
  });
});

//Get request for general web server home
app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.login_name) {
      response.status(401).send(JSON.stringify("No user logged in!"));
    } else {
      User.find( {}, '_id first_name last_name', function(err, doc) {
        if (err) {
          console.error('Doing /user/list error:', err);
          response.status(400).send(JSON.stringify(err));
          return;
        } else {
          response.status(200).send(JSON.stringify(doc));
        }
      });
    }
});

/*
 * URL /user/:id - Return the information for User (id)
 * User detail get request handler
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.login_name) {
      response.status(401).send(JSON.stringify("No user logged in!"));
      return;
    }
    let param = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(param)) {
      response.status(400).send('Bad id param ' + param);
      return;
    } else {
        User.findOne({ _id: param }, function(err, user) {
          user = JSON.parse(JSON.stringify(user)); //JSON object
          if (err) {
              console.error('Doing /user/:id error:', err);
              response.status(400).send(JSON.stringify(err));
              return;
          } else {
            user.__v = undefined;
            user.login_name = undefined;
            user.password = undefined;
            let responseObject = {};
            responseObject.user = user;
            //Handle photo permissions
            Photo.find({ user_id: user._id }, 'user_id comments file_name date_time permissions', function(err, photos) {
              photos = JSON.parse(JSON.stringify(photos));
              if (err) {
                console.error('Error in photo processing', err)
                return;
              } else {
                let maxComments = null;
                let recentDate = null;
                for (let i = 0; i < photos.length; i++) {
                  let noSelfPermission = photos[i].user_id !== request.session.user_id; //No permission as current user
                  let noOutsiderPermission = (photos[i].permissions !== undefined) //No permission as outside user
                                              && !(photos[i].permissions.indexOf(request.session.login_name) > -1);
                  if (noSelfPermission && noOutsiderPermission) { //No permissions at all
                    continue;
                  }
                  //Process photo with most comments
                  if (maxComments === null) { //First photo
                    responseObject.commentPhoto = photos[i];
                    if (photos[i].comments) { //Comments exist
                      maxComments = photos[i].comments.length;
                    } else {
                      maxComments = 0;
                    }
                  } else { //Compare photo comments to current max comment
                    if (photos[i].comments && (photos[i].comments.length > maxComments)) { //has comments
                      responseObject.commentPhoto = photos[i];
                      maxComments = photos[i].comments.length;
                    }
                  }
                  //Process most recent photo
                  if (recentDate == null) { //No photo in place
                    responseObject.recentPhoto = photos[i];
                    recentDate = photos[i].date_time;
                  } else { //Compare photo dates
                    let dateOne = new Date(photos[i].date_time).getTime();
                    let dateTwo = new Date(recentDate).getTime();
                    if (dateOne > dateTwo) { //Date comparison
                      responseObject.recentPhoto = photos[i];
                      recentDate = photos[i].date_time;
                    }
                  }
                }
                response.status(200).send(responseObject);
                return;
              }
            });
        }});
    }
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.login_name) {
      response.status(401).send(JSON.stringify("No user logged in!"));
      return;
    }
    let param = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(param)) { //Invalid param
      response.status(400).send('Bad id param ' + param);
      return;
    } else {
      Photo.find({ user_id: param }, 'user_id comments file_name date_time permissions likes userLikes', function(err, photos) {
        photos = JSON.parse(JSON.stringify(photos));
        let samplePhotos = [];
        if (err) {
          console.error('Doing /photosOfUser/:id error:', err);
          response.status(400).send(JSON.stringify(err));
          return;
        } else {
          async.each(photos, function(photo, callback1) { //Async photos
            //Conditional for permissions
            let canAccess = false;
            if (typeof photo.permissions === 'undefined') { //permissions not specified (all-access)
              canAccess = true;
            } else { //Permissions specified
              for (let i = 0; i < photo.permissions.length; i++) {
                if ((photo.permissions[i] === request.session.login_name) || (photo.user_id === request.session.user_id)) {
                  canAccess = true; //Has permission 
                  break;
                }
              }
            }
            async.each(photo.comments, function(comment, callback2) { //Async comments
              let userID = comment.user_id;
              User.findOne({_id: userID}, '_id first_name last_name', function(err, user) {
                if (err) {
                  console.err('User was not found');
                  response.status(400).send(JSON.stringify(err));
                  callback2("failed");
                } else {
                  let userObject = {_id: user._id,
                                    first_name: user.first_name,
                                    last_name: user.last_name};
                  comment.user_id = undefined;
                  comment['user'] = userObject;
                  callback2();
                }
              });
            },
            function(err) { //Callback to second async
              if (err) {
                console.error('A comment failed to process');
                response.status(400).send(JSON.stringify(err));
                callback1("failed");
              } else {
                callback1();
              }
            });
            if (canAccess) { //add if permission satisfied
              samplePhotos.push(photo);
            }
          },
          function(err) { //Callback to first async
            if (err) {
              console.error('A photo failed to process');
              response.status(400).send(JSON.stringify(err));
              return;
            } else {
              console.log("SAMPLES", samplePhotos);
              response.status(200).send(JSON.stringify(samplePhotos));
            }
          });
        }
      });
    }
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
