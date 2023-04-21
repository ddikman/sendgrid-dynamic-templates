#! /usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const getTemplateFiles = require('../src/get-template-files.js');
const getUploadOptions = require('../src/upload-options.js');
const { uploadTemplate } = require('../src/sendgrid.js');

const templatesDir = path.join(process.cwd(), 'templates');

async function main(){
    const uploadOptions = await getUploadOptions(templatesDir);
    const files = await getTemplateFiles(templatesDir);
    for (const file of files) {
        await uploadTemplate(file.templateId, file.templateContent, uploadOptions);
    }
}

main().catch(console.error);