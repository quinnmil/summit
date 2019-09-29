const express = require('express')
const router = express.Router()
const request = require('request')
const config = require('../../config')

// SOUTH_SISTER_URL = 'https://api.weather.gov/points/44.1034,-121.7692'
// 44.1034, -121.7692 -- South Sister

var options = {
  headers: { 'user-agent': 'node.js' }
}

router.get('/:mountain', function (req, res) {
  var mountain = req.params.mountain
  var url = config.NWSURL + config[mountain]
  getWeather(url, function (err, data) {
    if (!err) {
      res.send(data)
    } else {
      res.send(err)
    }
  })
})

const getWeather = function (url, callback) {
  request(url, options, function (err, res) {
    if (!err) {
      console.log('No error from getWeather')
      var obj = JSON.parse(res.body)
      var forecastURL = obj.properties.forecast
      request(forecastURL, options, function getForecast (err, res) {
        if (!err) {
          var forecast = JSON.parse(res.body)
          var twoPeriods = [forecast.properties.periods[0], forecast.properties.periods[1]]
          callback(null, twoPeriods)
        } else {
          console.log('error in getForecast')
          callback(err, null)
        }
      })
    } else {
      console.log('error in getWeather')
      callback(err, null)
    }
  })
}

module.exports = router
