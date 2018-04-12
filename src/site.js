'use strict';

const common = require('./common');
const Post = require('./post');

class Site {

    static async getPosts(pageNo = 1) {
        const pageUrl = `${common.url}forumdisplay.php?fid=19&orderby=dateline&page=${pageNo}`;
        let page = await common.getPage();
        await page.goto(pageUrl);

        const postElements = await page.$$eval(common.selector.posts, (elements) => elements.map(element => element.innerHTML));
        let posts = [];
        for (let html of postElements) {
            let post = new Post(html);
            if (post.like >= common.config.like) {
                posts.push(post);
            }
        }

        return posts;
    }

    static async getPageCount() {
        const firstPage = `${common.url}forumdisplay.php?fid=19&orderby=dateline&page=1`;

        let page = await common.getPage();
        await page.goto(firstPage);

        let lastPage = await page.$eval(common.selector.lastPost, (element) => element.href);
        let matches = /page=(\d+)/.exec(lastPage);

        return matches ? matches[1] : 1;
    }
}

module.exports = Site;