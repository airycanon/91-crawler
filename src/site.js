'use strict';

const common = require( './common');

class Site {

    static async getPosts(pageNo = 1) {
        const pageUrl = `${common.url}forumdisplay.php?fid=19&orderby=dateline&page=${pageNo}`;
        this.page = await common.getPage();
        await this.page.goto(pageUrl);

        let postElements = await this.page.$$(common.selector.posts);

        let data = {posts: [], next: postElements.length ? pageNo + 1 : 0};
        for (let postElement of postElements) {
            let count = await this.getLikeCount(postElement);
            if (count >= common.config.like) {
                let url = await this.getPostUrl(postElement);
                data.posts.push(url);
            }
        }

        return data;
    }

    static async getLikeCount(element) {
        let likeElement = await element.$(common.selector.postLikeCount);

        let count = 0;
        if (likeElement) {
            let text = await this.page.evaluate(likeElement => likeElement.innerHTML, likeElement);
            let matches = /(\d+)/.exec(text);
            if (matches.length) {
                count = matches[0];
            }
        }

        return count;
    }

    static async getPostUrl(element) {
        let urlElement = await element.$(common.selector.postUrl);

        return await this.page.evaluate(urlElement => urlElement.href, urlElement);
    }
}

module.exports = Site;