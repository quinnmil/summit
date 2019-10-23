
const express = require('express')
const router = express.Router()
const ATScraper = require('../controllers/allTrailsScraper.js')
const RedditScraper = require('../controllers/redditScraper.js')
const getComments = require('../controllers/getComments')
const mongo = require('../helpers/mongo')

router.get('/all', function (req, res) {
  getComments('south sister', 'south_ridge').then(result => {
    console.log('got result-- all comments: ', result)
    res.send(result)
  }).catch(error => {
    console.log('error in get comments: ', error)
    res.send(error)
  })
})

router.get('/allTrails', function (req, res) {
  ATScraper(ALLTRAILS_URL, function (err, data) {
    if (!err) {
      mongo.connect('south_sister', 'south_ridge' + '_comments', function (err, db, collection) {
        if (!err) {
          insertComments(collection, data, function (err, result) {
            if (!err) {
              console.log('No error on insert')
              if (result) {
                updateLatest(db, result, function (err) {
                  if (!err) {
                    console.log('sucessfully updated latest timestamp')
                    mongo.close()
                    return res.send('success')
                  } else {
                    console.log('there was a problem connecting: ', err)
                    mongo.close()
                    return res.send(err)
                  }
                })
              } else {
                console.log('No new posts, not updating latest')
                mongo.close()
                return res.send('success')
              }
            } else {
              console.log('Error on insert: ', err)
              mongo.close()
              return res.send(err)
            }
          })
        } else {
          console.log('Mongo connection error')
          return res.send(err)
        }
      })
    } else {
      console.log('bad scrape, ouch')
      return res.send(err)
    }
  })
})

const insertComments = function (collection, comments, callback) {
  if (comments.length !== 0) {
    collection.insertMany(comments, function (err, result) {
      if (!err) {
        console.log('inserted', result.ops.length, 'comments')
        var latest = result.ops[0].timeStamp // this will be the most recent comment. might need to update later.
        return (callback(null, latest))
      } else {
        return callback(err, null)
      }
    })
  } else {
    return (callback(null, null))
  }
}

const updateLatest = function (db, latest, callback) {
  console.log('calling updateLatest')
  const meta = db.collection('Meta')
  meta.updateOne({ attribute: 'latestComment' }, { $set: { timeStamp: latest } }, { upsert: true }, function (err, res) {
    if (!err) {
      console.log('Updated latest comment to: ', latest)
      return (callback(null, res))
    }
    console.log('error in updateLatest()', err)
    return (callback(err))
  })
}

module.exports = router

// // query to find the latest post
// collection.find({}, {timeStamp: 1, _id: 0}).sort({timeStamp: -1}, function(err, cursor) {
