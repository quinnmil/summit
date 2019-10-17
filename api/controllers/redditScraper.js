/*
**  Guides:
**  https://developers.google.com/web/fundamentals/primers/async-functions
**  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
*/
const Snoowrap = require('snoowrap')
const config = require('../../config')
const request = require('request')

// Wrapper for Reddit API
const r = new Snoowrap({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:69.0) Gecko/20100101 Firefox/69.0',
  clientId: config.redditClientId,
  clientSecret: config.redditclientSecret,
  username: config.redditUsername,
  password: config.redditPassword
})

// Search for the term 'south sister' and restrict results to r/mountaineering
const SEARCHURL = 'https://www.reddit.com/r/Mountaineering/search.json?q=south sister&limit=10&restrict_sr=true'
const LEN_BONUS = 1
const WORD_BONUS = 1

// Makes a call to the API to get a list of posts matching our search query
const getPosts = function (url, callback) {
  request(SEARCHURL, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      var posts = []
      var rs = JSON.parse(response.body)
      for (var entry of rs.data.children) {
        posts.push(entry.data)
      }
      callback(null, posts)
    } else {
      callback(error, null)
    }
  })
}

// Get a list of comment bodies from a post
async function getComments (post, callback) {
  // Get this post's comments
  const comments = await r.getSubmission(post).expandReplies({ limit: 10, depth: 3 })

  // Add the comment bodies to list
  const AllComments = []
  // console.log('comment0: ', comments.comments[0])
  for (const comment of comments.comments) {
    var com = {}
    com.author = comment.author.name
    com.body = comment.body
    com.body_html = comment.body_html
    com.permalink = comment.permalink
    com.score = comment.score
    com.subreddit = comment.subreddit_name_prefixed
    com.timestamp = comment.created_utc // .created also an optino
    com.depth = comment.depth
    com.guildings = comment.guildings

    AllComments.push(com)
  }
  return AllComments
}

// Filter through an array of posts to get the data you want
// Return a list of objects
async function processArray (array, callback) {
  var AllPosts = []
  // fetch all posts in parallel
  const postPromises = array.map(async post => {
    var Post = {}
    // .title is the string of the title
    // .name is a hash used to loop up this post with snoowrapper
    if (post.name && post.name !== 'done') {
      // console.log('post: ', post)
      Post.title = post.title
      Post.score = post.score
      Post.author = post.author
      Post.timestamp = post.created_utc
      const postComments = await getComments(post.name)
      Post.comments = postComments
      return Post
    }
  })

  // Add the posts in sequence
  for (const postPromise of postPromises) {
    // Wait for each post to be returned
    const p = await postPromise
    AllPosts.push(p)
  }
  return AllPosts
}

const WordList = [
  'weather', 'condition', 'trail', 'path', 'time', 'season', 'cloud', 'windy', 'sun', 'climb', 'difficult', 'easy', 'challeng', 'permit', 'view'
]

// Example of the kind of grading function that could be used
function GradeComments (posts) {
  var scores = []
  for (const post of posts) {
    var baseline = post.score * (1 / 5)
    for (const comment of post.comments) {
      comment.body.replace(/[\t\n\\]+/g, ' ')
      var reasons = []
      var score = 0
      var wordCount = comment.body.split(' ').length

      // // Question posts could be marked seperately?
      // if (post.body.includes('?')) {
      //   score += 1
      // }
      var scoreDiff = comment.body.score - baseline
      if (scoreDiff > 0) {
        score += scoreDiff
        reasons.push('upvotes')
      }
      if (wordCount > 20) {
        score += LEN_BONUS
        reasons.push('length: ' + wordCount)
      }
      for (const w in WordList) {
        if (comment.body.includes(WordList[w])) {
          score += WORD_BONUS
          reasons.push('word: ' + WordList[w])
        }
      }
      // Questions probably wont be as useful
      if (comment.body.includes('?')) {
        score = score - (WORD_BONUS * 5)
        reasons.push('question')
      }
      comment.computedScore = score
      comment.reasons = reasons
      scores.push(score)
    }
  }
  getStats(scores)
}

function getStats (scores) {
// mean of scores
  var total = 0
  var i = 0
  // console.log('scores: ', scores)
  for (i; i < scores.length; i++) {
    total += scores[i]
  }
  console.log('total number of scores: ', scores.length, 'total: ', total)
  var avg = total / scores.length
  console.log('average score: ', avg)
}

function stripComments (Posts) {
  var comments = []
  for (const post of Posts) {
    for (const comment of post.comments) {
      comments.push(comment)
    }
  }
  return comments
}

function sortCommentsbyDate (comments) {
  comments.sort((a, b) => (b.timestamp - a.timestamp))
}

function sortCommentsbyGrade (comments) {
  comments.sort((a, b) => (b.computedScore - a.computedScore))
}

// Entrypoint
const comments = function (url, callback) {
  getPosts(url, (err, res) => {
    if (!err) {
      processArray(res)
        .then(AllPosts => {
          console.log('---- Grading Comments ----')
          GradeComments(AllPosts)
          console.log('---- Grading Complete ----')
          console.log('---- Stripping Comments ----')
          var comments = stripComments(AllPosts)
          console.log('---- Strip Complete ----')
          console.log('---- Sorting Comments ----')
          sortCommentsbyGrade(comments)
          console.log('---- Sorting Complete ----')
          console.log('sorted comments: ', JSON.stringify(comments))
        })
        .catch(error =>
          console.log('caught error: ', error))
    } else { console.log('error: ', err) }
  })
}

comments(SEARCHURL)

// module.exports = comments
