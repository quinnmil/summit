const Snoowrap = require('snoowrap')
const config = require('../../config')
const request = require('request')

const r = new Snoowrap({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:69.0) Gecko/20100101 Firefox/69.0',
  clientId: config.redditClientId,
  clientSecret: config.redditclientSecret,
  username: config.redditUsername,
  password: config.redditPassword
})

const SEARCHURL = 'https://www.reddit.com/r/Mountaineering/search.json?q=south sister&limit=10&restrict_sr=true'
// search for the term 'south sister' and restrict results to r/mountaineering

const getPosts = function (url, callback) {
  request(SEARCHURL, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      var posts = []
      var rs = JSON.parse(response.body)
      for (var entry of rs.data.children) {
        // console.log(entry.data)
        posts.push(entry.data)
      }
      callback(null, posts)
    } else {
      callback(error, null)
    }
    //   console.log(re)
  })
}

const getComments = function (post, callback) {
  r.getSubmission(post).expandReplies({ limit: 10, depth: 3 }).then(comments => {
    // console.log('logging')
    var commentsBodies = []
    // console.log(comments)
    for (var c of comments.comments) {
      commentsBodies.push(c.body)
    }
    // console.log("comment bodies: ", commentsBodies)
    return new Promise(resolve => commentsBodies)
  })
}

async function processArray (array, callback) {
  var AllPosts = []
  array.forEach(async (post) => {
    var Post = {}
    // .title is the string of the title
    // .name is a hash used to loop up this post with snoowrapper
    // console.log('post: ', post, 'title:', post.title)
    if (post.name && post.name !== 'done') {
      Post.title = post.title
      var comments = await getComments(post.name)
      console.log('comments: ', comments)
      Post.comments = comments
      AllPosts.push(Post)
      // (err, comments) => {
      // if (!err) {
      //   console.log('comments for post: ', post.title)
      //   console.log(comments)
      //   Post.comments = comments
      //   // builder.push(Post)
      // }
    }
  })
  return AllPosts
  // want this to call after each getComments has returned
  // callback(null, AllPosts)
}

const comments = function (url, callback) {
  // var AllPostsAndComments = []
  getPosts(url, (err, res) => {
    if (!err) {
      // console.log(res)
      //   console.log(res)
      // AllPost is a promise
      var AllPosts = processArray(res).then(AllPosts => AllPosts)
      // This waits for the promise to resolve
      // console.log(AllPosts)

      AllPosts.then(result => {
        console.log('allposts: ', result)
      })
      console.log(' --- Done scraping all comments ---')
    } else { console.log('error: ', err) }
    // console.log(AllPostsAndComments)
    console.log('done')
  })
}

comments(SEARCHURL)

module.exports = comments

//     comments => {
//   for (var comment of comments) {
//     console.log('loggin')
//     console.log(comment.body)
//   }
// })

// var subcomments = r.getSubmission('t3_d2c2w2').comments.fetchAll()

// comments.author(console.log)

// var js = subcomments.then(comments => comments.body)
// console.log(js)
