# Sengrid Dynamic Templates Bulk Updater

This tool helps you generate and upload Sendgrid Dynamic Templates in bulk.

If your system has more than a few templates, likely they all share the same header/footer and only the content is different.

What do you do when your logo or footer url changes? This tool to the rescue!

```shell
$ SENDGRID_API_KEY=your-api-key
$ yarn upload
The template directory is set to /Users/ddikman/code/sendgrid-dynamic-templates/templates. Is this correct? (y/n) y
Do you want to increase the version? (y/n) y
Enter the new version name: Aug-22 Footer update
Skipping non-HTML file: some-other-file.txt
Template [Login email] (d-a2176d95113e410caf19c145dc5e5882) version [Aug-22 Footer update] created
```

## Usage

1. You need to either add a `.env` file or set the `SENDGRID_API_KEY` in the current terminal.
2. Then add your html templates into the `templates/` folder, named by the ID of the template you have
3. Run `yarn upload` and answer the prompts

I recommend you start with just a single template file in the `templates/` directory to see if everything works as expected. You might even want to create a new template first and test with.

## API Key requirements

For the API key, it only requires the `Template Engine` permissions so you can keep it slim reduce the risk.

![Only Template Engine permissions are required](./required-permisson.png)

## Generating template files

Although you can use this tool by just placing your email templates in the `templates/` folder and use only the upload function, you will likely want to generate your email templates using layouts as well.

You do this by adding your template layout in `layouts/your-template.html` and then your emails, prefixed with the template name in `emails/your-template_d-123xxx.html`.

When you run `yarn generate` that will loop through all emails in the `emails/` folder and output them to `templates/` replacing the `<!-- EMAIL CONTENT -->` with the contents of your email.

## Limitations

You must have the template created in Sendgrid first with a version.