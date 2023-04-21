const fs = require('fs').promises;
const path = require('path');
const getEmailFiles = require('./src/get-email-files');
const getUnique = require('./src/get-unique');

// Define the paths to the layouts, emails, and templates directories
const layoutsDir = path.join(__dirname, 'layouts');
const emailsDir = path.join(__dirname, 'emails');
const templatesDir = path.join(__dirname, 'templates');

const replaceMarker = '<!-- EMAIL CONTENT -->'

async function getLayouts(layoutNames) {
    const layouts = {}
    for (const templateName of layoutNames) {
        layouts[templateName] = await fs.readFile(path.join(layoutsDir, `${templateName}.html`), 'utf8')
    }
    return layouts
}

async function main() {
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

// // Call the getEmailFiles function to get a list of email files
// getEmailFiles((err, emailData) => {
//   if (err) throw err;

//   // Loop over each email file
//   emailData.forEach(({ emailFile, emailId, emailLayout }) => {
//     // Read in the contents of the email file
//     fs.readFile(path.join(emailsDir, emailFile), 'utf8', (err, emailContents) => {
//       if (err) throw err;

//       // Read in the contents of the layout file
//       fs.readFile(path.join(layoutsDir, `${emailLayout}.html`), 'utf8', (err, layoutContents) => {
//         if (err) throw err;

//         // Replace the {{CONTENTS}} marker with the email contents
//         const finalContents = layoutContents.replace('{{CONTENTS}}', emailContents);

//         // Write the final contents to the template file
//         fs.writeFile(path.join(templatesDir, `${emailId}.html`), finalContents, (err) => {
//           if (err) throw err;
//           console.log(`${emailFile} converted to ${emailId}.html`);
//         });
//       });
//     });
//   });
// });
