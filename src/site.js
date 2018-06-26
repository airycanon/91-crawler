'use strict';

const common = require('./common');
const Post = require('./post');

class Site {

    static async getPosts(pageNo = 1) {
        let posts = [];
        const pageUrl = `${common.url}forumdisplay.php?fid=19&orderby=dateline&page=${pageNo}`;
        try {
            let page = await common.getPage();
            await page.goto(pageUrl, {timeout: common.config.timeout});
            const postElements = await page.$$eval(common.selector.posts, (elements) => elements.map(element => element.innerHTML));
            for (let html of postElements) {
                let post = new Post(html);
                if (post.like >= common.config.like) {
                    posts.push(post);
                }
            }
        } catch (e) {
            console.log(e);
        }

        return posts;
    }

    static async getPageCount() {
        const firstPage = `${common.url}forumdisplay.php?fid=19&orderby=dateline&page=1`;

        let page = await common.getPage();
        try {
            await page.goto(firstPage, {timeout: common.config.timeout});
            let lastPage = await page.$eval(common.selector.lastPost, (element) => element.href);
            let matches = /page=(\d+)/.exec(lastPage);

            return matches ? matches[1] : 1;
        } catch (e) {
            console.log(e);
        }

        return 1;
    }
}

module.exports = Site;