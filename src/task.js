const common = require('./common');
const crypto = require('crypto');


class Task {

    constructor(post) {
        this.post = post;
    }

    async run() {
        let images = await this.parse();
        if (images.length > common.config.count) {
            let path = common.config.path + '/' + this.post.date;
            if (!common.fs.existsSync(path)) {
                common.fs.mkdirSync(path);
            }

            path = path + '/' + this.post.title;
            if (!common.fs.existsSync(path)) {
                common.fs.mkdirSync(path);
            }

            for (let [index, image] of images.entries()) {
                let page = await common.getPage();
                let response = await page.goto(image);
                let buffer = await response.buffer();
                common.fs.writeFileSync(path + '/' + index + '.jpg', buffer);
            }

            return images.length;
        }

        return 0;
    }

    async parse() {
        let page = await common.getPage();
        await page.goto(this.post.url);
        await page.waitFor(1000);
        let selector = common.selector.postImages;
        let images = await page.evaluate((selector) => {
            return Object.values(document.querySelectorAll(selector)).map(image => image.src);
        }, selector);

        console.log('共' + images.length + '图片');

        return images;
    }
}

module.exports = Task;