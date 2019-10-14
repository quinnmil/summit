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
  const commentBodies = []
  for (const comment of comments.comments) {
    commentBodies.push(comment.body)
  }
  return commentBodies
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
      Post.title = post.title
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

// Entrypoint
const comments = function (url, callback) {
  getPosts(url, (err, res) => {
    if (!err) {
      processArray(res)
        .then(AllPosts => {
          console.log('allposts: ', AllPosts)
        })
    } else { console.log('error: ', err) }
  })
}

comments(SEARCHURL)

module.exports = comments
