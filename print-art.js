const fs = require('fs');
const home = require('os').homedir();

module.exports = {
    success: async () => {
        const data = await fs.promises.readFile(home + '/Code/pdf-scrape/success-art.txt')
        console.log(data.toString());
    },
    fail: async () => {
        const data = await fs.promises.readFile(home + '/Code/pdf-scrape/fail-art.txt')
        console.log(data.toString());
        console.log('dude')
    },
}