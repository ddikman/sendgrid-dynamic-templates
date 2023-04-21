const fs = require('fs');
const path = require('path');

function getEmailFiles(emailsDir) {
    return new Promise((resolve, reject) => {
        fs.readdir(emailsDir, (err, emailFiles) => {
            if (err) {
                reject(err)
                return
            }

            const filteredFiles = emailFiles.filter((file) => path.extname(file) === '.html');
            const emailData = filteredFiles.map((filename) => {
                const nameParts = filename.split('_');
                const name = nameParts[1];
                const layoutName = nameParts[0];
                return { filename, name, layoutName };
            });

            resolve(emailData)
        });
    })

}

module.exports = getEmailFiles;