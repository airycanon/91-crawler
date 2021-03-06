'use strict'

const config = require('../config');
const puppeteer = require('puppeteer');
const Queue = require('bee-queue');
const fs = require('fs');
const cheerio = require('cheerio');

process.setMaxListeners(Infinity);

class Common {
    async init() {
        const args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ];

        config.proxy && args.push('--proxy-server=' + config.proxy);

        this.browser = await puppeteer.launch({
            args: args,
            headless: true
        });

        this.fs = fs;
        this.cheerio = cheerio;
        this.config = config;

        this.profile = {
            'name': 'Google Chrome',
            'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'viewport': {
                'width': 1200,
                'height': 800,
                'deviceScaleFactor': 1,
                'isMobile': false,
                'hasTouch': false,
                'isLandscape': false
            }
        };

        this.selector = {
            url: '#navcontainer ul > li:nth-child(4) > a',
            lastPost: '.pages a.last',
            posts: 'tbody[id*=normalthread]',
            postTitle: 'span[id*=thread]',
            postUrl: 'span[id*=thread] a',
            postLikeCount: 'font[color=green]',
            postDate: '.author em',
            postImages: 'img[file]'
        };

        this.queue = new Queue('posts', {
            prefix: 'spider-queue',
            redis: {
                host: config.redis,
                port: 6379,
                db: 0,
                options: {}
            }
        });

        const page = await this.getPage();
        await page.goto('http://91porn.com/index.php', {waitUntil: 'networkidle0'});
        this.url = await page.$eval(this.selector.url, element => element.href);
    }

    async getPage() {
        let pages = await this.browser.pages();
        if (pages && pages.length) {
            return pages[0];
        }
        let page = await this.browser.newPage();
        await page.emulate(common.profile);

        return page;
    }
}

let common = new Common();

module.exports = common;