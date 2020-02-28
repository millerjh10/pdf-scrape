const puppeteer = require('puppeteer')
const cheerio = require('cheerio');
const home = require('os').homedir();
const fs = require('fs');

const printArt = require('./print-art');

let currentTick = 0;
const tick = () => {
    // return ptof('tick ' + (++currentTick))
    return;
};

const fname = './koch.log';
const ptof = (message) => new Promise((resolve, reject) => {
    return fs.promises.appendFile(fname, message + '\n\n')
        .then(resolve => resolve(true)).catch(reject);
});

const print = (message) => {
    console.log('\n' + message + '\n')
}

const printFile = (name, data) => new Promise((resolve, reject) => {
    return fs.promises.writeFile(name, data)
        .then(resolve).catch(reject);
});

const getNewFolderName = (parentFolderPath) => {
    let batchNum = 1;
    let dir = parentFolderPath + '/batch' + batchNum++; 
    while (fs.existsSync(dir)) {
        dir = parentFolderPath + '/batch' + batchNum++;
    }
    fs.mkdirSync(dir);
    return dir;
}

const checkFileExists = s => new Promise((resolve, reject) => {
    return fs.promises.access(s, fs.F_OK)
        .then(resolve).catch(reject);
});

async function printPDFs(url, linkSelector) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let success = false;
    for (const x of [1, 2, 3]) {
        try {
            await page.goto(url, {waitUntil: 'networkidle0', timeout: 10000});
            success = true;
        } catch (e) {
            await printArt.fail();
            print(`Failed to fetch ${url}\n${e}\nRetrying Jimmy!`);
            continue;
        }
    }
    if (!success) {
        print(`Ran out of tries for ${url}\n${e}\Sorry Jimmy!`);
        return;
    }
    print('We got the links!');

    await tick();
    const html = await page.content();
    const $ = await cheerio.load(html);
    const links = await $(linkSelector)
    await tick();

    const subfolder = 'Desktop/Scraped PDFs';
    const folderPath = getNewFolderName(`${home}/${subfolder}`);
    print('Made folder ' + folderPath);
    for (const link of Array.from(links)) {    
        const linkURL = link.attribs.href;
        const linkTitle = link.children[0].data;
        const pdfName = `${linkTitle}.pdf`;
        const pdfPath =  `${folderPath}/${pdfName}`;
        let success = false;
        for (const x of [1, 2, 3]) {
            try {
                await page.goto(linkURL, {waitUntil: 'networkidle0', timeout: 10000});
                success = true;
            } catch (e) {
                await printArt.fail();
                print(`Failed to fetch ${linkURL}\n${e}\nRetrying Jimmy!`);
                continue;
            }
        }
        if (!success) {
            print(`Ran out of tries for ${linkURL}\n${e}\Sorry Jimmy!`);
            continue;

        }
        await tick()
        const pdf = await page.pdf({ format: 'A4', margin: {
            bottom: '50px',
        }});    
        await tick()
        await printArt.success();
        await printFile(pdfPath, pdf);
        print(`Created "${pdfName}"`);
    }

    console.log('All done!');
    await browser.close();
    return;
}



process.on('unhandledRejection', async error => {
    console.log('unhandledRejection', error.message);
    printArt.success();
    await printArt.fail();
    print('Your program has crashed Jimmy :(');
    process.exit(1);
});

const url = process.argv[2] || 'https://phys.org/physics-news';
const linkSelector = 'body > main > div > div:nth-child(2) > div.col-7.col-lg-6.pr-3 > div:nth-child(4) > div > div.sorted-news-list.px-3 a.news-link';

printPDFs(url, linkSelector);
