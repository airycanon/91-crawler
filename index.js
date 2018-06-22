'use strict';

const common = require('./src/common');
const Site = require('./src/site');
const cluster = require('cluster');
const Task = require("./src/task");

class App {

    async run() {
        await common.init();

        if (cluster.isMaster) {
            for (let i = 0; i < common.config.worker; i++) {
                cluster.fork({i});
            }
            let page = process.argv.length > 2 ? parseInt(process.argv[2]) : await Site.getPageCount();
            await this.createJobs(page);
        } else {
            common.queue.process(async (job) => {
                let task = new Task(job.data);
                return await task.run();
            });
        }
    }

    async createJobs(page) {
        console.log(`开始获取第 ${page} 页`);
        let posts = await Site.getPosts(page);

        while (posts.length) {
            let post = posts.pop();
            let job = common.queue.createJob(post);
            job.save();
            job.on('succeeded', (result) => {
                if (result) {
                    console.log(`已保存${result} 张图片`);
                }
            });
        }

        const next = page - 1;
        next && setTimeout(async () => {
            await this.createJobs(next)
        }, common.config.timeout);

        return Promise.resolve();
    }
}

(async function () {
    await new App().run();
})();







