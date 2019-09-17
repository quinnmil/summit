const express = require('express');
const router = express.Router();
const scraper = require('../controllers/allTrailsScraper.js');

const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail';


router.get('/', function(req, res) {
    scraper(ALLTRAILS_URL, function (err, data) {
        if (err) return res.send(err);
        res.send(data)
    })
})

module.exports = router;
