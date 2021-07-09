const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const Group = require("../models/group")
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
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
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

router.post("/create", (req, res, next) => {
    
         
            const group = new Group({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              creationDate: req.body.creationDate,
              members: req.body.members,
              balance: req.body.balance,
              avatarImage: req.body.avatarImage
            });
            group
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "Group created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
        
     

    
    
});

router.delete("/:groupId", (req, res, next) => {
    Group.remove({ _id: req.params.groupId })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "Group deleted"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });
  router.get("/:groupId", (req, res, next) => {
    const id = req.params.groupId;
    Group.findById(id)
      .select("name members creationDate _id avatarImage balance")
      .exec()
      .then(doc => {
        console.log("From database", doc);
        if (doc) {
          res.status(200).json({
              group: doc,
              
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
  router.get("/", (req, res, next) => {
    Group.find()
      .select("name members creationDate _id avatarImage balance")
      .exec()
      .then(docs => {
        const response = {
          count: docs.length,
          products: docs.map(doc => {
            return {
              name: doc.name,
              members: doc.members,
              creationDate: doc.creationDate,
              balance: doc.balance,
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
  router.put("/:groupId", (req, res, next) =>{
    const groupId = req.params.groupId;
    Group.findOneAndUpdate({_id: groupId},{
      $set: {
          name: req.body.name,
          members: req.body.members,
          balance: req.body.balance,
          creationDate: req.body.creationDate,
          avatarImage: req.body.avatarImage
      }
    })
    .then(result =>{
      res.status(200).json({
        updated: 'Group Updated'
      })
    })
    .catch(err =>{
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
  });
  router.put("/updateBalance/:groupId", (req, res, next) =>{
    const groupId = req.params.groupId;

    Group.findOneAndUpdate({_id: groupId},{
      $set: {
          balance: [
            {
              user: req.body.user,
              bal: req.body.bal
            }
          ]
      }
    })
    .then(result =>{
      res.status(200).json({
        updated: 'Balance Updated'
      })
    })
    .catch(err =>{
      console.log(err);
      res.status(500).json({
        error: err
      })
    })
  });
  
  module.exports = router;