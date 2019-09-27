const express = require('express')
const router = express.Router()
const mongo = require('../helpers/mongo')

router.get('/:mountain/:trail', function (req, res) {
  var mountain = req.params.mountain
  var trail = req.params.trail
  mongo.connect(mountain, trail + '_comments', function (err, db, collection) {
    if (!err) {
      var amount = typeof (req.query.amt) !== 'undefined' ? req.query.amt : 10
      console.log('Getting ', amount, 'entries from database')
      collection.find().sort({ timeStamp: -1 }).limit(parseInt(amount)).toArray(function (err, result) {
        if (!err) {
          console.log(result)
          res.json(result)
        } else {
          console.log('error on find')
          res.send(err)
          mongo.close()
        }
      })
    } else {
      console.log('error on connect')
      mongo.close()
      res.send(err)
    }
  })
})

module.exports = router
