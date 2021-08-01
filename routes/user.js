const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const multer = require('multer');
const User = require("../models/user");
const Otp = require("../models/otp");
const path = require('path');
var nodemailer = require('nodemailer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ||file.mimetype === 'image/jpg' ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});




router.post("/signup", async function (req, res, next) {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              avatarImage: req.body.avatarImage,
              extra: req.body.extra
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
    
    let data = await User.findOne({email: req.body.email});
    const response = {};
    if(data){
        let otpcode = Math.floor(Math.random()*10000+1);
        let otpData = new Otp({
        email: req.body.email,
        code: otpcode,
        expireIn: new Date().getTime() + 300*1000
    })
    
    let otpResponse = await otpData.save();
  
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'prathamadi2001@gmail.com',
        pass: 'Pr@tham1'
      }
    });
    
    var mailOptions = {
      from: 'prathamadi2001@gmail.com',
      to: req.body.email ,
      subject: 'SignUp Successful',
      text: `Thnx for Signing Up `+ req.body.firstName + " Your otp for email verfication is : " + otpcode
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    }
    });
    
router.post("/file", upload.single('avatarImage'), (req, res, next) => {
	var avatar = req.file.path;
	res.status(201).json({
                  createdFile: {
                    avatarImage: "http://localhost:8080/" + avatar,
         	  }
         });
});

router.post("/verify", async function(req, res, next){
  let data = await Otp.find({email: req.body.email, code: req.body.otpCode});
  const response = {};
  if(data){
    let currentTime = new Date().getTime();
    let diff = data.expireIn - currentTime;
    if(diff < 0){
        response.message = 'Token Expire' 
        response.statusText = 'error';
    }else{
        res.status(201).json({
          message: "Email Verified"
        });
    }
    }
  else{
    response.message = 'Invalid Otp'
    response.statusText = 'Error';
  }
  res.status(200).json(response);
})

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            "" +process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/template", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            "" +process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Email Template Sent",
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'prathamadi2001@gmail.com',
        pass: 'Pr@tham1'
      }
    });
    
    fs.readFile('./views/html.html', {encoding: 'utf-8'}, function (err, html) {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: 'prathamadi2001@gmail.com',
          to: req.body.email ,
          subject: 'SignUp Successful',
          html: html
        };
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
    });
});


router.delete("/:userId",isAuth, (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
router.get("/:userId",isAuth, (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .select('firstName lastName email _id avatarImage')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
            product: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:8000/'
            }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
router.get("/",isAuth, (req, res, next) => {
  User.find()
    .select("firstName lastName email _id avatarImage")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            firstname: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            avatarImage: doc.avatarImage,
            _id: doc._id,
            
          };
        })
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
router.put("/:userId", isAuth, (req, res, next) =>{
  const userId = req.params.userId;
  User.findOneAndUpdate({_id: userId},{
    $set: {
        email: req.body.email,
        
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatarImage: req.body.avatarImage
    }
  })
  .then(result =>{
    res.status(200).json({
      updated: 'User Updated'
    })
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json({
      error: err
    })
  })
});
router.post("/email_verification", async function(req, res, next){
  let data = await User.findOne({email: req.body.email});
  const response = {};
  if(data){
      let otpcode = Math.floor(Math.random()*10000+1);
      let otpData = new Otp({
      email: req.body.email,
      code: otpcode,
      expireIn: new Date().getTime() + 300*1000
    })
    let otpResponse = await otpData.save();
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'prathamadi2001@gmail.com',
        pass: 'Pr@tham1'
      }
    });
    
    var mailOptions = {
      from: 'prathamadi2001@gmail.com',
      to: req.body.email ,
      subject: 'SignUp Successful',
      text: `Thnx for Signing Up `+ req.body.firstName + 'You OTP for resetting passsword is: ' + otpcode 
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
  else{
  response.statusText = 'error'
  response.message = 'Email Id not exists';
  }
  res.status(200).json('Ok');
})
router.post("/change_password", async function(req, res, next){
    let data = await Otp.find({email: req.body.email, code: req.body.otpCode});
    const response = {};
    if(data){
      let currentTime = new Date().getTime();
      let diff = data.expireIn - currentTime;
      if(diff < 0){
          response.message = 'Token Expire' 
          response.statusText = 'error';
      }else{
        bcrypt.hash(req.body.password, 10,async function (err, hash){
            let user = await User.findOne({email: req.body.email})
            user.password = hash;
            user.save();
      })
      }
    }
    else{
      response.message = 'Invalid Otp'
      response.statusText = 'Error';
    }
    res.status(200).json(response);
})
function isAuth(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }

}

module.exports = router;