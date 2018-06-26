const common = require('./common');
const crypto = require('crypto');


class Task {

    constructor(post) {
        this.post = post;
    }

    async run() {
        let saved = 0;
        let images = await this.parse();
        if (images.length > common.config.count) {

            let path = common.config.path + '/' + this.post.date;
            if (!common.fs.existsSync(path)) {
                common.fs.mkdirSync(path);
            }

            console.log(`开始保存图片，位置${path}，共${images.length}张`);

            path = path + '/' + this.post.title;
            if (!common.fs.existsSync(path)) {
                common.fs.mkdirSync(path);
            }

            for (let [index, image] of images.entries()) {
                try {
                    let page = await common.getPage();
                    let response = await page.goto(image, {timeout: common.config.timeout});
                    let buffer = await response.buffer();
                    common.fs.writeFileSync(path + '/' + index + '.jpg', buffer);
                    saved++;
                } catch (e) {
                    console.log(e);
                }
            }
            if (saved) {
                console.log(`图片保存完成，共${saved}张`);
            }
        }

        return saved;
    }

    async parse() {
        let page = await common.getPage();
        let images = [];
        try {
            await page.goto(this.post.url, {timeout: common.config.timeout});
            let selector = common.selector.postImages;
            images = await page.evaluate((selector) => {
                return Object.values(document.querySelectorAll(selector)).map(image => image.src);
            }, selector);
        } catch (e) {
            console.log(e);
        }

        return images;
    }
}

module.exports = Task;