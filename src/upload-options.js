const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function confirmTemplateDir(templateDir) {
    return new Promise((resolve) => {
        readline.question(
            `The template directory is set to ${templateDir}. Is this correct? (y/n) `,
            (answer) => {
                if (answer.toLowerCase() !== 'y') {
                    console.log('Aborting script');
                    readline.close();
                    process.exit(0);
                } else {
                    resolve();
                }
            });
    })
}

function askForVersionName() {
    return new Promise((resolve) => {
        readline.question(
            'Enter the new version name: ',
            (answer) => {
                const versionName = answer.trim();
                resolve(versionName);
            }
        );
    });
}

function askForVersionIncrease() {
    return new Promise((resolve) => {
        readline.question(
            'Do you want to increase the version? (y/n) ',
            (answer) => {
                const increaseVersion = answer.toLowerCase() === 'y';
                resolve(increaseVersion);
            }
        );
    });
}

function getUploadOptions(templateDir) {
    const options = {
        increaseVersion: false,
        versionName: null,
    }
    return new Promise(async (resolve) => {
        await confirmTemplateDir(templateDir);

        options.increaseVersion = await askForVersionIncrease();
        if (options.increaseVersion) {
            options.versionName = await askForVersionName();
        }

        // done asking
        readline.close();

        resolve(options)
    });
}

module.exports = getUploadOptions;