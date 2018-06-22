const common = require('./common')
const format = require('date-fns/format')

class Post {
    constructor(html) {
        const $ = common.cheerio.load(html, {
            normalizeWhitespace: true,
            xmlMode: true
        });
        this.url = common.url + $(common.selector.postUrl).attr('href');
        this.title = $(common.selector.postTitle).text();
        this.like = 0;

        const likeText = $(common.selector.postLikeCount).text();
        if (likeText) {
            let matches = /(\d+)/.exec(likeText);
            this.like = matches.length ? matches[0] : 0;
        }

        let date = $('.author em').text();
        this.date = format(date,'YYYY-MM-DD');
    }
}

module.exports = Post;