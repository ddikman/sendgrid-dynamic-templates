#! /usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const getEmailFiles = require('../src/get-email-files');
const getUnique = require('../src/get-unique');
const createDirIfMissing = require('../src/create-dir-if-missing');

// Define the paths to the layouts, emails, and templates directories
const layoutsDir = path.join(process.cwd(), 'layouts');
const emailsDir = path.join(process.cwd(), 'emails');
const templatesDir = path.join(process.cwd(), 'templates');

const replaceMarker = '<!-- EMAIL CONTENT -->'

async function getLayouts(layoutNames) {
    const layouts = {}
    for (const templateName of layoutNames) {
        layouts[templateName] = await fs.readFile(path.join(layoutsDir, `${templateName}.html`), 'utf8')
    }
    return layouts
}

async function main() {
    await createDirIfMissing(templatesDir)

    const emails = await getEmailFiles(emailsDir)
    const layouts = await getLayouts(getUnique(emails.map(({ layoutName }) => layoutName)))
    for (const { filename, name, layoutName } of emails) {
        const contents = await fs.readFile(path.join(emailsDir, filename), 'utf8')
        const finalContents = layouts[layoutName].replace(replaceMarker, contents)
        await fs.writeFile(path.join(templatesDir, name), finalContents)
        console.log(`${filename} converted to ${name}`)
    }
}

main().catch(console.error)