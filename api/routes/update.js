
const express = require('express');
const router = express.Router();
const scraper = require('../controllers/allTrailsScraper.js');

var config = require('../config')
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
    
                insertComments(db, data, function() {
                    console.log("Comments inserted, closing");
                    client.close();
                })
            }
            console.log("there was a problem connecting");
            client.close()
            res.send(err)

        })
        // res.send(data)
        
    })
    // res.send("done");
})

const insertComments = function(db, comments, callback) {
        const collection = db.collection('Comments');
        collection.insertMany(comments, function (err, result){
            if (!err) {
                console.log("inserted", result.ops.length, "comments")
                callback(result);
            }


        })

    
    }

module.exports = router;