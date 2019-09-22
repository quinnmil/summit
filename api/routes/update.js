
const express = require('express');
const router = express.Router();
const scraper = require('../controllers/allTrailsScraper.js');

var config = require('../../config')
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongoURL, {useNewUrlParser: true});

const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail';


router.get('/', function(req, res) {
    console.log("uri: ", config.mongoURL)
    scraper(ALLTRAILS_URL, function (err, data) {
        if (err) return res.send(err);

        client.connect (function (err) {
            if (!err) {
                console.log("Connected to Mongo Server");
                const db = client.db("south_sister")
                const collection = db.collection('Comments');

    
                insertComments(collection, data, function(err, result) {
                    if (!err) {
                        console.log(result, "Comments inserted, closing");
                        client.close();
                    }
                    console.log("Error on insert: ", err);
                })
                updateLatest(db, collection, function (err, result) {
                    if (!err){
                        console.log("result")
                    }
                } )
            }
            console.log("there was a problem connecting");
            client.close()
            res.send(err)

        })    
    })
})

const insertComments = function(collection, comments, callback) {
        collection.insertMany(comments, function (err, result){
            if (!err) {
                console.log("inserted", result.ops.length, "comments")
                callback(result);
            }
        })
    }

const updateLatest = function(db, collection, callback) {
    var latest = collection.find({}, {timeStamp: 1, _id: 0}).sort({timeStamp: -1}).limit(1).next();   // gets newest timestamp
    const meta = db.collection('meta');

    meta.updateOne({attribute: "latestComment"}, { $set: {timeStamp: latest['timeStamp']}}, {upsert: true})

}

module.exports = router;