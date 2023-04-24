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

function askForTemplateToUpload() {
    return new Promise((resolve) => {
        readline.question('Enter the id of the template to upload or press enter to upload all templates: ', (answer) => {
            const templateId = answer.trim().length > 0 ? answer.trim() : null;
            resolve(templateId);
        })
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
        templateId: null
    }
    return new Promise(async (resolve) => {
        await confirmTemplateDir(templateDir);

        options.templateId = await askForTemplateToUpload();

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