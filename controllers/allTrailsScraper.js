const express = require('express');
const request = require('request')
const cheerio = require('cheerio');

// const ALLTRAILS_URL = 'https://www.alltrails.com/trail/us/oregon/south-sister-trail';
// const TEST_URL = 'https://quinnmil.github.io';


var comments = function getComments (url, callback) {
    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            var comments = []
            const $ = cheerio.load(html)
            $('#reviews div.feed-item').each((i, el) => {
                var author = $(el)
                    .find('span.xlate-none').text() 
                var comment =$(el)
                    .find('p.xlate-google').text()
                var datePublished = $(el)
                    .find('span.subtext.pull-right').children('meta').attr('content')
                comments.push({
                    author: author,
                    comment: comment,
                    datePublished: datePublished
                });
            });
            console.log(comments);
            return(callback(comments, false));
            }
        else {
            console.error("Bad Response:", response)
            return(callback(null, response))
        }
        })
    // return response.render('allTrails', {data : comments})
}

module.exports = comments

// Query Examples for reference
//         const projects = $('.projects')
//         // console.log(projects.text())

//         // const output = projects.find('h5').text();
//         // const output = projects.children('h5').text(); // same as above
//         // const output = projects.children('h5').parent().text();

//         // looping through items
//         $('.projects p').each((index, element) => {
//             const item = $(element)
//             .text()
//             .replace(/\s\s+/g, '');     // remove spaces not between words
//             console.log(item);
            
//         });
//         $('.icons a').each((i, el) => {
//             const link = $(el)
//             // .find('a')
//             .attr('href');
//             console.log(link);
