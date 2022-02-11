import { ResolvedIntlConfig } from 'react-intl/src/types';

const enUSMessages: ResolvedIntlConfig['messages'] = {
    // Common stuff
    company: `Estuary`,
    productName: `Control Plane`,
    'common.loading': `Loading...`,
    'common.errors.heading': `Error`,
    'common.errors.source.missing': `No sources found.`,
    'common.optionsMissing': `No options`,

    // Header
    'header.navigationMenu.aria.label': `Expand Navigation`,

    // CTA
    'cta.cancel': `Cancel`,
    'cta.delete': `Delete`,
    'cta.download': `Download`,
    'cta.login': `Login`,
    'cta.clickHere': `click here`,

    // Error Boundry
    'errorBoundry.title': `Error`,
    'errorBoundry.message1': `Sorry - there was an unexpected error in some UI code. `,
    'errorBoundry.message2': `Expand to see more details.`,

    // Common form stuff
    'forms.validation.failure.heading': `Form failed validation`,
    'capturesource.label': `Source type`,
    'capturesource.fetch.failed': `Failed to fetch source types`,
    'username.label': `User Name`,

    // Login Page Stuff
    'login.main.message': `This isn't a real login form. Whatever username you enter will be used in the UI.`,
    'login.help.message': `If you need help logging in`,

    //Login Help Page
    'loginHelp.header': `Login Help`,

    // Capture creation modal
    'captureCreation.ctas.test.config': `Test Capture`,
    'captureCreation.heading': `New Capture`,
    'captureCreation.instructions': `To get started please provide a unique name and the source type of the Capture you want to create. Once you've filled out the source details you can click "Test Capture" down below to test the connection.`,
    'captureCreation.tenant.label': `Tenant`,
    'captureCreation.name.label': `Name`,
    'captureCreation.name.description': `Name of the capture - must be unique. (ex: acemCo/marketing_data)`,
    'captureCreation.image.label': `Source`,
    'captureCreation.image.description': `The connector you want to use to connect to your endpoint.`,
    'captureCreation.config.source.doclink': `Connector Docs`,
    'captureCreation.config.testing': `Testing configuration...`,
    'captureCreation.config.testing.failed': `Capture test failed`,
    'captureCreation.finalReview.instructions': `Look over the catalog configuration that was generated. If you want to edit anything you can do that directly in the editor. Once you're ready you can download the file for your local.`,

    // Captures main page
    'captures.main.message1': `Click the "New Capture" button up above to get started.`,
    'captures.main.message2': `It will guide you through generating and downloading a valid {docLink}.`,
    'captures.main.message2.docLink': `catalog spec`,
    'captures.main.message2.docPath': `https://docs.estuary.dev/concepts/#catalogs`,

    // Landing page content
    'home.main.header': `Welcome to Control Plane!`,
    'home.main.description': `Click the Capture link over on the side navigation to get started.`,

    //Rest of the pages go down here. They don't have real pages right now.
    'admin.header': `Administration`,
    'logs.main.message': `This is where we will show the logs for the system.`,
    'users.main.message': `This is where you will be able to manage your users... basically a little User CRUD UI.`,
};

export default enUSMessages;
