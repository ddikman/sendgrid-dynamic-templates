const { Client } = require('@sendgrid/client');

if (process.env.SENDGRID_API_KEY === undefined) {
    throw new Error("SENDGRID_API_KEY environment variable not set");
}

const sgClient = new Client();
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

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
        subject: body.subject
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
    const [response,] = await sgClient.request(request);
    if (response.statusCode === 200) {
        console.log(`Template [${existingTemplate.name}] (${templateId}) version [${existingVersion.name}] updated`)
    } else if (response.statusCode === 201) {
        console.log(`Template [${existingTemplate.name}] (${templateId}) version [${versionName}] created and activated`)
    } else {
        console.log(`Unknown status code from updating ${templateId}: ${response.statusCode}, please confirm result`)
    }
}

module.exports = {
    getExistingTemplate,
    uploadTemplate
}