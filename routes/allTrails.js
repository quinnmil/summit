const express = require('express');
const router = express.Router();
const scraper = require('../controllers/allTrailsScraper.js');

const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail';


router.get('/', (req, res) => {
    res.json(scraper(ALLTRAILS_URL))
})

module.exports = router;
