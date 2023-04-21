const dotenv = require("dotenv")
dotenv.config()

const path = require("path")
const fs = require("fs").promises
const createDirIfMissing = require("../src/create-dir-if-missing")
const { downloadTemplates } = require("../src/sendgrid")

async function main() {
    const templates = await downloadTemplates()
    await createDirIfMissing("emails")
    for (const template of templates) {
        const filename = 'unknown-layout_' + template.id + ".html"
        const content = `<!-- ${template.name} -->\n\n${template.content}`
        await fs.writeFile(path.join("emails", filename), content)
        console.log(`Written template ${filename}`)
    }
}


main().catch(console.error)