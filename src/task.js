const common = require('./common');
const crypto = require('crypto');
const fs = require('fs');

class Task {

    constructor(url) {
        this.url = url;
    }

    async run() {
        let {images, title} = await this.parse();
        if (images.length > common.config.count) {
            const md5 = crypto.createHash('md5').update(title).digest("hex");
            const path = common.config.path + '/' + md5;

            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }

            for (let [index, image] of images.entries()) {
                let page = await common.getPage();
                let response = await page.goto(image);
                let buffer = await response.buffer();
                fs.writeFileSync(path + '/' + index + '.jpg', buffer);
            }

            console.log('已保存图片，共' + images.length + '张');
        }

        return Promise.resolve();
    }

    async parse() {
        let page = await common.getPage();

        await page.goto(this.url);

        await page.waitFor(1000);

        let selector = common.selector.postImages;
        let images = await page.evaluate((selector) => {
            return Object.values(document.querySelectorAll(selector)).map(image => image.src);
        }, selector);
        let title = await page.$eval(common.selector.postTitle, element => element.innerHTML);

        console.log('共' + images.length + '图片');

        return {images, title};
    }
}

module.exports = Task;