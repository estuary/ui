// We DO NOT need this file sorted as it makes it easier for folks to update/see changes
import { ResolvedIntlConfig } from 'react-intl/src/types';

const CommonMessages: ResolvedIntlConfig['messages'] = {
    // Common stuff
    'company': `Estuary`,
    'productName': `Control Plane`,
    'common.loading': `Loading...`,
    'common.errors.heading': `Error`,
    'common.optionsMissing': `No options`,
    'common.noData': `No data to display`,
    'common.loggedOut': `You have been logged out. Please log back in.`,

    // Header
    'header.navigationMenu.aria.label': `Expand Navigation`,

    // CTA
    'cta.addToChangeSet': `Add to Change Set`,
    'cta.cancel': `Cancel`,
    'cta.continue': `Continue`,
    'cta.delete': `Delete`,
    'cta.download': `Download`,
    'cta.login': `Login`,
    'cta.oidc.google': `Login with Google`,
    'cta.clickHere': `click here`,
    'cta.moreDetails': `More Details`,
    'cta.saveEntity': `Save and ACTIONWORD`,

    // Terms
    'terms.connectors': `Connectors`,

    // Data
    'data.name': `Name`,
    'data.description': `Description`,
    'data.type': `Type`,
    'data.maintainer': `Maintainer`,
    'data.updated_at': `Updated`,
    'data.email': `Email`,
    'data.display_name': `User Name`,

    // Confirmations
    'confirm.title': `Are you sure?`,
    'confirm.loseData': `You have unsaved worked. If you continue you will lose your changes.`,

    // Full Page
    'fullpage.error': `Major Error`,

    // Connectors table
    'connectors.title': `All installed connectors`,

    // Error Boundry
    'errorBoundry.title': `Error`,
    'errorBoundry.message1': `Sorry - there was an unexpected error in some UI code. `,
    'errorBoundry.message2': `Expand to see more details.`,

    // Common form stuff
    'forms.validation.failure.heading': `Form failed validation`,
    'capturesource.label': `Source type`,
    'capturesource.fetch.failed': `Failed to fetch source types`,
    'username.label': `User Name`,

    // Captures main page
    'captures.main.message1': `Click the "New Capture" button up above to get started.`,
    'captures.main.message2': `It will guide you through generating and downloading a valid {docLink}.`,
    'captures.main.message2.docLink': `capture spec`,
    'captures.main.message2.docPath': `https://docs.estuary.dev/concepts/#captures`,

    // Landing page content
    'home.main.header': `Welcome to Flow!`,
    'home.main.description': `Click the Capture link over on the side navigation to get started.`,

    //Rest of the pages go down here. They don't have real pages right now.
    'admin.header': `Administration`,

    'logs.main.message': `This is where we will show the logs for the system.`,
    'users.main.message': `This is where you will be able to manage your users... basically a little User CRUD UI.`,

    'changeSet.header': `Unsaved Changes`,
    'changeSet.title': `Unsaved Changes Table`,

    'changeSet.data.entityType': `Entity Type`,
    'changeSet.data.entity': `Entity`,
    'changeSet.data.lastUpdated': `Last Updated`,
    'changeSet.data.details': `Details`,
};

const Login_Page: ResolvedIntlConfig['messages'] = {
    'login.oidc.message': `Please use one of the providers below to continue.`,
};

const Capture_Create: ResolvedIntlConfig['messages'] = {
    'captureCreation.ctas.discover': `Test Config`,
    'captureCreation.heading': `New Capture`,
    'captureCreation.instructions': `To get started please provide a unique name and the source type of the Capture you want to create. Once you've filled out the source details you can click "Test Capture" down below to test the connection.`,
    'captureCreation.missingConnectors': `No connectors installed. You must install a source connector before being able to create a capture.`,
    'captureCreation.tenant.label': `Tenant`,
    'captureCreation.name.label': `Name`,
    'captureCreation.name.description': `Name of the capture - must be unique. (ex: acemCo/marketing_data)`,
    'captureCreation.image.label': `Source`,
    'captureCreation.image.description': `The connector you want to use to connect to your endpoint.`,
    'captureCreation.config.source.doclink': `Connector Docs`,
    'captureCreation.save.failed': `Capture creation failed. Please see below for details:`,
    'captureCreation.editor.default': `Before you can edit the Capture Catalog you need to fill out the connection config section and click Discover`,
    'captureCreation.finalReview.instructions': `Look over the catalog configuration that was generated. If you want to edit anything you can do that directly in the editor. Once you're ready you can download the file for your local.`,
};

const Materialization_Create: ResolvedIntlConfig['messages'] = {
    'materializationCreation.heading': `New Materialization`,
    'materializationCreation.instructions': `To get started please provide a unique name, select an endpoint type, and select the Collections you want to Materialize. After that you can review the YAML before saving.`,
};

const enUSMessages: ResolvedIntlConfig['messages'] = {
    ...CommonMessages,
    ...Login_Page,
    ...Capture_Create,
    ...Materialization_Create,
};

export default enUSMessages;
