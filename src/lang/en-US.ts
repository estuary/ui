import { ResolvedIntlConfig } from "react-intl/src/types";

const enUSMessages: ResolvedIntlConfig['messages'] = {
    // Common stuff
    "common.loading": `Loading...`,
    "common.errors.heading": `Error`,
    "common.errors.source.missing": `No sources found.`,

    // CTA 
    "cta.cancel": `Cancel`,
    "cta.delete": `Delete`,
    "cta.download": `Download`,

    // Common form stuff
    "forms.validation.failure.heading": `Form failed validation`,

    "capturesource.label": `Source type`,
    "capturesource.fetch.failed": `Failed to fetch source types`,

    // Capture creation modal
    "captureCreation.ctas.test.config": `Test Capture`,
    "captureCreation.heading": `New Capture`,
    "captureCreation.instructions": `To get started please provide a unique name and the source type of the Capture you want to create. Once you've filled out the source details you can click "Test Capture" down below to test the connection.`,
    "captureCreation.form.tenant.label": `Tenant`,
    "captureCreation.form.name.label": `Name`,
    "captureCreation.form.source.label": `Source`,
    "captureCreation.config.source.doclink": `Connector Docs`,
    "captureCreation.testing.config.loading": `Testing configuration...`,
    "captureCreation.testing.config.failed": `Capture test failed`,
    "captureCreation.final.review.instructions": `Look over the catalog configuration that was generated. If you want to edit anything you can do that directly in the editor. Once you're ready you can download the file for your local.`,

    // Captures main page
    "captures.main.message1": `Click the "New Capture" button up above to get started.`,
    "captures.main.message2": `It will guide you through generating and downloading a valid {docLink}.`,
    "captures.main.message2.docLink": `catalog spec`,
    "captures.main.message2.docPath": `https://docs.estuary.dev/concepts/#catalogs`,

    // Landing page content
    "home.main.header": `Welcome to Control Plane!`,
    "home.main.description": `Click the Capture link over on the side navigation to get started.`,

    //Rest of the pages go down here. They don't have real pages right now.
    "admin.main.message": `This will most likely be a smaller "sub app" where you can view logs, alerts, users, etc.`,
    "logs.main.message": `This is where we will show the logs for the system.`,
    "users.main.message": `This is where you will be able to manage your users... basically a little User CRUD UI.`
};

export default enUSMessages;