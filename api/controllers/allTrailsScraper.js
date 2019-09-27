const request = require('request')
const cheerio = require('cheerio')

const mongo = require('../helpers/mongo')

const comments = function (url, callback) {
  getLatest(function (err, latest) {
    if (!err) {
      console.log('No error from get latest')
      scrapeComments(url, latest, function (err, res) {
        if (!err) {
          console.log('Good Response')
          return (callback(null, res))
        } else {
          console.error('Bad response: ', err)
          return (callback(err, null))
        }
      })
    } else {
      console.log('bad makeRequest')
      return callback(err, null)
    }
  })
}

const getLatest = function (callback) {
  mongo.connect('south_sister', 'Meta', function (err, db, col) {
    if (!err) {
      col.findOne({}, { attribute: 'latestComment' }, function (err, result) {
        if (!err) {
          if (!result) {
            console.log('No metadata, faking latest')
            mongo.close()
            var d = new Date(2015, 1, 1)
            return (callback(null, d))
          }
          var latest = new Date(result.timeStamp)
          console.log('latest post:', latest)
          mongo.close()
          return (callback(null, latest))
        } else {
          console.log('meta lookup error', err)
          return (callback(err, null))
        }
      })
    }
  })
}

const scrapeComments = function (url, latestPost, callback) {
  request(url, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      var comments = []
      const $ = cheerio.load(html)

      $('#reviews div.feed-item').each((i, el) => {
        var author = $(el)
          .find('span.xlate-none').text()
        var comment = $(el)
          .find('p.xlate-google').text().replace(/[\t\n\\]+/g, ' ')
          // console.log("comment: " , comment)
        var datePublished = $(el)
          .find('span.subtext.pull-right').children('meta').attr('content')
        var timeList = $(el)
          .find('span.subtext.pull-right').text().split(' ')

        var timeSince = 0
        if (['minutes', 'minute'].includes(timeList[1])) {
          timeSince = timeList[0] * 60 // [minutes] * seconds
        } else if (['hour', 'hours'].includes(timeList[1])) {
          timeSince = timeList[0] * (60 * 60) // [hours] * minutes * seconds
        } else if (['day', 'days'].includes(timeList[1])) {
          timeSince = timeList[0] * (24 * 60 * 60) // [days] * hours * minutes * seconds
        }
        var d = new Date()
        d = d.setSeconds(0, 0) - (timeSince * 1000)
        d = new Date(d)
        // this will still process though every comment on page.
        console.log('author: ', author.padEnd(10), ' d: ', d, 'latest: ', latestPost)
        if (d > latestPost && comment !== '') {
          console.log(' ======= adding a comment from author: ', author.padEnd(10), 'from: ', d, 'since the latest post is from: ', latestPost)
          comments.push({
            timeStamp: d,
            source: 'All Trails',
            URL: url,
            text: comment,
            datePublished: datePublished,
            photo: null
          })
        }
      })
      // after looping through each comment
      return callback(null, comments)
    } else {
      console.log('request error: ', error)
      return callback(error, null)
    }
  })
}

module.exports = comments
