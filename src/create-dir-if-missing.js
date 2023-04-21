const fs = require('fs').promises;

async function createDirIfMissing(dir) {
    try {
        await fs.access(dir, fs.constants.R_OK | fs.constants.W_OK)
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.mkdir(dir);
        } else {
            throw err;
        }
    }
}

module.exports = createDirIfMissing;