const request = require('request')
const cheerio = require('cheerio')

const scrapeComments = function (url, latestPost, callback) {
  var today = new Date() // Current day
  today = new Date(today.setHours(24, 0, 0, 0)) // Next midnight
  request(url, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      var comments = []
      const $ = cheerio.load(html) // Load the page

      /* Loop through each comment */
      $('#reviews div.feed-item').each((i, el) => {
        var author = $(el)
          .find('span.xlate-none').text()
        var comment = $(el)
          .find('p.xlate-google').text().replace(/[\t\n\\]+/g, ' ')
        var datePublished = $(el)
          .find('span.subtext.pull-right').children('meta').attr('content')
        var timeList = $(el)
          .find('span.subtext.pull-right').text().split(' ')
        /* Calculate the seconds since this was posted */
        var timeSince = 0
        if (['minutes', 'minute'].includes(timeList[1])) {
          timeSince = timeList[0] * 60 // [minutes] * seconds
        } else if (['hour', 'hours'].includes(timeList[1])) {
          timeSince = timeList[0] * (60 * 60) // [hours] * minutes * seconds
        } else if (['day', 'days'].includes(timeList[1])) {
          timeSince = timeList[0] * (24 * 60 * 60) // [days] * hours * minutes * seconds
          console.log('NEW LOOP: seconds since this post: ', timeSince)
        }
        /* Create timestamp for this comment */
        /* Is this a new comment? */
        console.log('author: ', author.padEnd(10), ' today: ', today, 'latest: ', latestPost)
        if (today > latestPost && comment !== '') {
          console.log(' ======= adding a comment from author: ', author.padEnd(10))
          comments.push({
            timeStamp: today,
            source: 'All Trails',
            URL: url,
            text: comment,
            datePublished: datePublished,
            photo: null
          })
        }
      })
      // after looping through each comment
      if (comments[0]) {
        return callback(comments[0].timeStamp)
      } else {
        return callback(new Error('nothing to add'))
      }
    } else {
      console.log('request error: ', error)
      return null
    }
  })
}

function done (latest) {
  console.log('\nlatest is now:', latest)
}

function print (latest) {
  console.log('\nlatest is now:', latest)
  setTimeout(function () {
    latest = new Date(latest)
    scrapeComments('https://www.alltrails.com/trail/us/oregon/south-sister-trail', latest, done)
  }, 60000)
}

function run () {
  scrapeComments('https://www.alltrails.com/trail/us/oregon/south-sister-trail', new Date(2015, 1, 1), print)
}

run()
