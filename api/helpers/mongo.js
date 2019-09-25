var config = require('../../config')
const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = {
  connect: function (database, collection, callback) {
    client.connect(function (err) {
      if (!err) {
        console.log('Connected to Mongo Server')
        const db = client.db(database)
        const col = db.collection(collection)
        return callback(null, db, col)
      }
      return callback(err, null, null)
    })
  },

  close: function () {
    client.close()
    console.log('Disconnected from Mongo Server')
  }
}
