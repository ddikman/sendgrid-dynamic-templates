const { Client } = require('@sendgrid/client');

if (process.env.SENDGRID_API_KEY === undefined) {
    throw new Error("SENDGRID_API_KEY environment variable not set");
}

// See Sendgrid API docs
// https://docs.sendgrid.com/api-reference/transactional-templates

const sgClient = new Client();
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

async function downloadTemplates() {
    const [, body] = await sgClient.request({
        url: `/v3/templates`,
        method: 'GET',
        qs: {
            generations: 'dynamic',
            page_size: 100
        }
    })

    console.log(`Found ${body.result.length} templates. Downloading...`)

    const templates = []
    for (const template of body.result) {
        const activeVersion = template.versions.find((version) => version.active)
        if (!activeVersion) {
            console.log(`Template ${template.name} has no active version, skipping`)
            continue
        }

        console.log(`Downloading template ${template.name} version ${activeVersion.name}...`)
        const versionDetails = await getExistingVersion(template.id, activeVersion.id)
        templates.push({
            name: template.name,
            id: template.id,
            content: versionDetails.content
        })
    }

    return templates
}

async function getExistingTemplate(templateId) {
    try {
        return await sgClient.request({
            method: 'GET',
            url: `/v3/templates/${templateId}`,
        }).then(([_, body]) => body);
    } catch (err) {
        if (err.code === 401) {
            throw 'Invalid API key';
        }
        console.log(err)
        throw `[${templateId}] [${err.code}] ${err.response?.body?.error}`;
    }
}

async function getExistingVersion(templateId, versionId) {
    const body = await sgClient.request({
        method: 'GET',
        url: `/v3/templates/${templateId}/versions/${versionId}`,
    }).then(([_, body]) => body);

    return {
        testData: body.test_data,
        subject: body.subject,
        content: body.html_content
    }
}

async function uploadTemplate(templateId, templateContent, uploadOptions) {
    const { increaseVersion, versionName } = uploadOptions;

    const existingTemplate = await getExistingTemplate(templateId);

    const existingVersion = existingTemplate.versions.find((version) => version.active);
    if (!existingVersion) {
        throw `Template ${templateId} has no versions, please create one in the SendGrid UI first`
    }

    const data = {
        name: increaseVersion ? versionName : existingVersion.name,
        html_content: templateContent
    };

    if (increaseVersion) {
        const existingVersionDetails = await getExistingVersion(templateId, existingVersion.id)
        data.subject = existingVersionDetails.subject,
            data.test_data = existingVersionDetails.testData
        data.active = 1
    }

    const request = {
        url: increaseVersion ? `/v3/templates/${templateId}/versions` : `/v3/templates/${templateId}/versions/${existingVersion.id}`,
        method: increaseVersion ? 'POST' : 'PATCH',
        body: data,
    };

    try {
        const [response,] = await sgClient.request(request);

        if (response.statusCode === 200) {
            console.log(`Template [${existingTemplate.name}] (${templateId}) version [${existingVersion.name}] updated`)
        } else if (response.statusCode === 201) {
            console.log(`Template [${existingTemplate.name}] (${templateId}) version [${versionName}] created and activated`)
        } else {
            console.log(`Unknown status code from updating ${templateId}: ${response.statusCode}, please confirm result`)
        }
    } catch (err) {
        if (err.code === 400) {
            console.error(`Template [${existingTemplate.name}] (${templateId}) version [${existingVersion.name}] not updated due to error:`)
            console.error(JSON.stringify(err.response.body, null, 2))
            return
        }
        throw `[${templateId}] [${err.code}] ${err.response?.body?.error}`; 
    }
}

module.exports = {
    getExistingTemplate,
    uploadTemplate,
    downloadTemplates
}