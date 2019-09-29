var express = require('express')
var router = express.Router()

/* Testing JSON */
router.get('/', function (req, res, next) {
  res.json({ test: 'success' })
})

module.exports = router
