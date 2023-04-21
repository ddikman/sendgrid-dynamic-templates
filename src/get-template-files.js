const fs = require('fs');
const path = require('path');

async function getTemplateFiles(templatesDir) {
  const files = [];
  const fileNames = await fs.promises.readdir(templatesDir);
  for (const fileName of fileNames) {
    if (!fileName.endsWith('.html')) {
      console.log(`Skipping non-HTML file: ${fileName}`);
    }
    if (!fileName.startsWith('d-')) {
      console.log(`Skipping non-dynamic template file (must follow format d-xxx): ${fileName}`);
    }

    const templateId = fileName.replace('.html', '');
    const templatePath = path.join(templatesDir, fileName);
    const templateContent = await fs.promises.readFile(templatePath, 'utf8');
    files.push({ templateId, templateContent });
  }
  return files;
}

module.exports = getTemplateFiles;