const express = require('express');
const request = require('request')
const cheerio = require('cheerio');


var comments = function getComments (url, callback) {
    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            var comments = []
            const $ = cheerio.load(html)
            $('#reviews div.feed-item').each((i, el) => {
                var author = $(el)
                    .find('span.xlate-none').text() 
                var comment =$(el)
                    .find('p.xlate-google').text().replace(/[\t\n\\]+/g,' ')
                var datePublished = $(el)
                    .find('span.subtext.pull-right').children('meta').attr('content')
                var timeList = $(el)
                    .find('span.subtext.pull-right').text().split(' ')
                var timeSince;
                if (timeList[1] === "hours") {
                    timeSince = timeList[0] * 60;
                }
                else if (timeList[1] === "days") {
                    timeSince = timeList[0] * (24*60);
                }
                var d = new Date(Date.now() - (timeSince * 60000))                
                // var postedTime = d.toString()

                comments.push({
                    timeStamp: d,
                    source: "All Trails", 
                    URL: url,
                    text: comment,
                    datePublished: datePublished,
                    photo: null,
                });
            });
            // console.log(comments);
            return(callback(false, comments));
            }
        else {
            console.error("Bad Response:", response)
            return(callback(response, null))
        }
    })
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
