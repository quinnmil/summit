const request = require('request');
const express = require('express');
const cheerio = require('cheerio');

var config = require('../../config')
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongoURL, {useNewUrlParser: true});

const comments = function getComments (url, callback) {
    getLatest(function (err, res) {
        if (!err){
            console.log("No error from get latest");
            makeRequest(url, res, function (err, res) {
                if (!err) {
                    console.log("Good Response");
                    // console.log("comments:" , comments)
                    return (callback(false, res));
                }
                else {
                    console.error("Bad response: ", err);
                    return(callback(err, null));
                }
            })
        }
        else{
            console.log("bad makeRequest")
            return callback(err, null);
        }
    })
}        

const getLatest = function(callback) {
    const db = client.db("south_sister");
    db.collection('Meta').findOne({}, {attribute: "latestComment"}, function (err, result) {
        if (!err){
            console.log("latest post:", result.timeStamp)
                var latest = result.timeStamp;
                return(callback(null, latest));
        }
        else {
            console.log("meta lookup error", err);
            return(callback(err, null));
        }
    })
}


const makeRequest = function(url, latestPost, callback){
    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            var comments = []
            client.connect (function (err) {
                if(!err){
                    const $ = cheerio.load(html)
                    $('#reviews div.feed-item').each((i, el) => {
                        var comment =$(el)
                            .find('p.xlate-google').text().replace(/[\t\n\\]+/g,' ')
                        // console.log("comment: " , comment);
                        var datePublished = $(el)
                            .find('span.subtext.pull-right').children('meta').attr('content')
                        var timeList = $(el)
                            .find('span.subtext.pull-right').text().split(' ')
                        var timeSince;
                        if (timeList[1] === "hours") {
                            timeSince = timeList[0] * 60;
                        }
                        else if (timeList[1] === "days") {
                            timeSince = timeList[0] * (24*60);
                        }
                        var d = new Date(Date.now() - (timeSince * 60000)) 
                        // If the post is older than the latest in the db, stop here.
                        console.log(" TIMING DEBUGGER --- d: ", d, "latest: ", latestPost);
                        if (d < latestPost){
                            console.log("comment is too old");
                            return callback(null, comments);
                        }
                        else if (comment !== ""){
                            comments.push({
                                timeStamp: d,
                                source: "All Trails", 
                                URL: url,
                                text: comment,
                                datePublished: datePublished,
                                photo: null,
                            });
                        }
                    });
                    return callback(null, comments);
                }
                else {
                    console.log('throwing here')
                    return callback(err, null);
                }
            });
        }
        else {
            console.log(" request error: ", error);
        }
    })
}

module.exports = comments
