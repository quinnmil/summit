const ATScraper = require('../controllers/allTrailsScraper.js')
const RedditScraper = require('../controllers/redditScraper.js')

const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail'
const REDDIT_URL = 'https://www.reddit.com/r/Mountaineering/search.json?q=south sister&limit=10&restrict_sr=true'

function scrapeAllSources (mountain, trail) {
  return new Promise((resolve, reject) => {
    var allComments = [] // all comment objects from all sources
    // TODO need to move the URLs into a 'sources' file.
    // TODO look into using promise.all to resolve both these at once
    ATScraper(ALLTRAILS_URL).then(result => {
      allComments.push(result)
      RedditScraper(mountain, 20).then(result => {
        console.log('received comments from reddit scraper')
        allComments.push(result)
        resolve(allComments)
      })
        .catch(error =>
          console.log('Reddit failed to get data for ', mountain, trail)
          console.log(error: 'error'))
    })
      .catch(error => {
        console.log('All Trails failed to get data for ', mountain, trail)
        console.log('error: ', error)
      // reject(err)
      })
  })
}

module.exports = scrapeAllSources
