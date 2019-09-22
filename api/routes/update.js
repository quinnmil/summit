
const express = require('express');
const router = express.Router();
const scraper = require('../controllers/allTrailsScraper.js');

var config = require('../../config')
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongoURL, {useNewUrlParser: true, useUnifiedTopology: true });

const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail';


router.get('/', function(req, res) {
    scraper(ALLTRAILS_URL, function (err, data) {
        if (err) {
            console.log("bad scrape, ouch");
            return res.send(err);
        }

        client.connect(function (err) {
            if (!err) {
                console.log("Connected to Mongo Server");
                const db = client.db("south_sister")
                const collection = db.collection('Comments');
    
                insertComments(collection, data, function(err, result) {
                    if (!err) {
                        console.log("no error on insertComments. RESULT: ", result);
                        
                        updateLatest(db, result, function (err, res) {
                            if (!err){
                                console.log("sucessfully updated latest ", res);
                                // res.send("success")
                            }
                            else {
                                console.log("there was a problem connecting: ", err);
                                // res.send(err);
                            }
                            client.close();
                        })
                        res.send("done")
                    }
                    else {
                        console.log("Error on insert: ", err);
                        client.close();
                        res.send(err);
                    }
                })
            }
            else {
                console.log("Mongo connection error");
            }
        })
    })
})

const insertComments = function(collection, comments, callback) {
    
    if (comments.length !== 0){
        collection.insertMany(comments, function (err, result){
            if (!err) {
                console.log("inserted", result.ops.length, "comments")
                if (result){
                    var latest = result.ops[0]['timeStamp'];
                    return (callback(null, latest));
                    // TODO return timestamp of newest comment
                }
            }
            else {
                return(callback(err, null));
            }
        })
    }
    else {
        return(callback(null, null));   // this is okay?
        }
    }

const updateLatest = function(db, latest, callback) {
    console.log('calling updateLatest')
    // collection.find({}, {timeStamp: 1, _id: 0}).sort({timeStamp: -1}, function(err, cursor) {
        // console.log("CURSOR: ",cursor);
        // latest = cursor
        // console.log('LATEST: ', latest.next());
        const meta = db.collection('Meta');
        meta.updateOne({attribute: "latestComment"}, { $set: {timeStamp: latest}}, {upsert: true}, function (err, res) {
            if (!err) {
                console.log("Updated latest comment to: ", latest);
                return(callback(null, res));
                }
            console.log ('error in updateLatest()', err);
            return(callback(err));
            })
        }
       // gets newest timestamp


module.exports = router;