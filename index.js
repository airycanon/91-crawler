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
            await this.createJobs(27);
        } else {
            common.queue.process(async (job) => {
                let task = await new Task(job.data.url);
                return await task.run();
            });
        }
    }

    async createJobs(page) {
        console.log(`开始获取第 ${page} 页`);
        let {posts, next} = await Site.getPosts(page);
        posts.length && console.log(`共 ${posts.length} 条`);
        for (let url of posts) {
            common.queue.createJob({url}).save();
        }

        next && setTimeout(async () => {
            await this.createJobs(next)
        }, common.config.timeout);

        return Promise.resolve();
    }
}

(async function () {
    await new App().run();
})();







