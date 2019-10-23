const ATScraper = require('../controllers/allTrailsScraper.js')
const RedditScraper = require('../controllers/redditScraper.js')

const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail'
const REDDIT_URL = 'https://www.reddit.com/r/Mountaineering/search.json?q=south sister&limit=10&restrict_sr=true'

function scrapeAllSources (mountain, trail) {
  return new Promise((resolve, reject) => {
    var allComments = [] // all comment objects from all sources
    // TODO need to move the URLs into a 'sources' file.
    ATScraper(ALLTRAILS_URL, function (err, data) {
      if (!err) {
        allComments.push(data)
      } else {
        console.log('All Trails failed to get data for ', mountain, trail)
        reject(err)
      }
    })
    RedditScraper(mountain, 20).then(result => {
      console.log('received comments from reddit scraper')
      allComments.push(result)
      resolve(allComments)
    })
      .catch(error =>
        console.log(error))
  })
}

module.exports = scrapeAllSources
