// We DO NOT need this file sorted as it makes it easier for folks to update/see changes
import { ResolvedIntlConfig } from 'react-intl/src/types';

const CommonMessages: ResolvedIntlConfig['messages'] = {
    // Common stuff
    'company': `Estuary`,
    'productName': `Control Plane`,
    'common.browserTitle': `Estuary Flow`,
    'common.loading': `Loading...`,
    'common.errors.heading': `Error`,
    'common.optionsMissing': `No options`,
    'common.noData': `No data to display`,
    'common.loggedOut': `You have been logged out. Please log back in.`,
    'common.missing': `N/A`,

    // Header
    'header.navigationMenu.aria.label': `Expand Navigation`,

    // CTA
    'cta.addToChangeSet': `Add to Change Set`,
    'cta.cancel': `Cancel`,
    'cta.close': `Close`,
    'cta.continue': `Continue`,
    'cta.delete': `Delete`,
    'cta.download': `Download`,
    'cta.login': `Login`,
    'cta.oidc.google': `Login with Google`,
    'cta.register': `Sign Up`,
    'cta.clickHere': `click here`,
    'cta.moreDetails': `More Details`,
    'cta.saveEntity': `Save and Publish`,
    'cta.restart': `Restart`,

    // Terms
    'terms.connectors': `Connectors`,

    // Data
    'data.name': `Name`,
    'data.firstName': `First name`,
    'data.lastName': `Last name`,
    'data.description': `Description`,
    'data.status': `Status`,
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
    'login.main.message': `When running locally you can login with whatever name you want.`,

    // Registration Page
    'register.heading': `We're currently accepting Beta partners.`,
    'register.main.message': `Please enter your information and our team will approve your account.`,
    'register.label.firstName': `First Name`,
    'register.label.lastName': `Last Name`,
    'register.label.email': `Email`,
    'register.label.company': `Company`,
    'register.label.intendedUse': `Describe your use case`,
    'register.label.documentAcknowledgement': `Accept our Terms of Service and Privacy Policy`,
    'register.existingAccount': `Already have an account?`,

    // Captures main page
    'captures.main.message1': `Click the "New Capture" button up above to get started.`,
    'captures.main.message2': `It will guide you through generating and downloading a valid {docLink}.`,
    'captures.main.message2.docLink': `capture spec`,
    'captures.main.message2.docPath': `https://docs.estuary.dev/concepts/#captures`,

    // Landing page content
    'home.main.header': `Welcome to Flow!`,
    'home.main.description': `Click the Capture link over on the side navigation to get started.`,

    // Error Page - Page Not Found
    'pageNotFound.heading': `Sorry, that page cannot be found.`,
    'pageNotFound.message': `Try searching for a page below or go directly to your {dashboard}.`,

    //Rest of the pages go down here. They don't have real pages right now.
    'admin.header': `Administration`,

    'logs.main.message': `This is where we will show the logs for the system.`,
    'users.main.message': `This is where you will be able to manage your users... basically a little User CRUD UI.`,

    'captureTable.header': `Published Captures`,
    'entityTable.title': `Entity Table`,

    'entityTable.filterLabel': `Filter Namespaces`,
    'entityTable.data.entity': `Name`,
    'entityTable.data.connectorType': `Type`,
    'entityTable.data.lastUpdated': `Last Updated`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.readsFrom': `Reads From`,
    'entityTable.data.writesTo': `Writes To`,

    'entityTable.unmatchedFilter.header': `Sorry, no result found.`,
    'entityTable.unmatchedFilter.message': `We could not find any data matching that filter. Try applying a different filter or using an alternative query option.`,

    'entityTable.technicalDifficulties.header': `Sorry, there was an issue getting your data.`,
    'entityTable.technicalDifficulties.message': `We apologize for the inconvenience. A message describing the issue can be found at the top of the page.`,
};

const RouteTitles: ResolvedIntlConfig['messages'] = {
    'routeTitle.dashboard': `Dashboard`,
    'routeTitle.admin': `Admin`,
    'routeTitle.captureCreate': `Create Capture`,
    'routeTitle.captureDetails': `Capture Details`,
    'routeTitle.captures': `Captures`,
    'routeTitle.collections': `Collections`,
    'routeTitle.error.pageNotFound': `Page Not Found`,
    'routeTitle.login': `Login`,
    'routeTitle.loginLoading': `Checking Credentials`,
    'routeTitle.materializationCreate': `Materialization Capture`,
    'routeTitle.materializationEdit': `Materialization Edit`,
    'routeTitle.materializations': `Materializations`,
    'routeTitle.registration': `Registration - NOT USED RIGHT NOW`,
};

const BrowserTitles: ResolvedIntlConfig['messages'] = {
    'browserTitle.dashboard': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.dashboard']}`,
    'browserTitle.admin': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.admin']}`,
    'browserTitle.captureCreate': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.captureCreate']}`,
    'browserTitle.captureDetails': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.captureDetails']}`,
    'browserTitle.captures': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.captures']}`,
    'browserTitle.collections': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.collections']}`,
    'browserTitle.error.pageNotFound': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.error.pageNotFound']}`,
    'browserTitle.login': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.login']}`,
    'browserTitle.loginLoading': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.loginLoading']}`,
    'browserTitle.materializationCreate': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.materializationCreate']}`,
    'browserTitle.materializationEdit': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.materializationEdit']}`,
    'browserTitle.materializations': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.materializations']}`,
    'browserTitle.registration': `${CommonMessages['common.browserTitle']} ${RouteTitles['routeTitle.registration']}`,
};

const Error: ResolvedIntlConfig['messages'] = {
    'error.title': `Error`,
    'error.message': `This is not something you did wrong. There was a technical issue fetching data. Please contact support.`,
    'error.codeLabel': `Code:`,
    'error.messageLabel': `Message:`,
    'error.detailsLabel': `Details:`,
    'error.hintLabel': `Hint:`,
};

const LogsDialog: ResolvedIntlConfig['messages'] = {
    'logs.default': `waiting for logs...`,
    'logs.toManyEmpty': `Logs may have ended. To restart fetching click ${CommonMessages['cta.restart']}.`,
};

const AdminPage: ResolvedIntlConfig['messages'] = {
    'connectorTable.title': `Installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.title.aria': `Table of all installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.filterLabel': `Filter Name or Detail`,
    'connectorTable.data.title': `Name`,
    'connectorTable.data.image_name': `Image`,
    'connectorTable.data.detail': `Details`,
    'connectorTable.data.protocol': `Protocol`,
    'connectorTable.data.updated_at': `Last Changed`,
    'connectorTable.data.documentation_url': `Documentation`,
    'connectorTable.data.actions': `Actions`,
    'connectorTable.actionsCta.capture': `Capture`,
    'connectorTable.actionsCta.materialization': `Materialization`,
    'admin.connectors.main.message1': `There are no connectors currently ready to be used.`,
    'admin.connectors.main.message2': `Please contact support to get help setting up a {docLink}.`,
    'admin.connectors.main.message2.docLink': `connector`,
    'admin.connectors.main.message2.docPath': `https://docs.estuary.dev/concepts/#connectors`,
};

const LoginPage: ResolvedIntlConfig['messages'] = {
    'login.oidc.message': `Please use one of the providers below to continue.`,
};

const CaptureCreate: ResolvedIntlConfig['messages'] = {
    'captureCreation.ctas.discover': `Test Config`,
    'captureCreation.ctas.discoverAgain': `Regenerate Catalog`,
    'captureCreation.heading': `${RouteTitles['routeTitle.captureCreate']}`,
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
    'captureCreation.test.waitMessage': `Please wait while we try to connect to this endpoint.`,
    'captureCreation.test.failedErrorTitle': `Config Test Failed`,
    'captureCreation.test.serverUnreachable': `Config Test was unable to reach server`,
    'captureCreation.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreation.save.serverUnreachable': `Config Save was unable to reach server`,
    'captureCreation.save.waitMessage': `Please wait while we test, save, and publish your capture.`,
    'captureCreation.status.running': `running...`,
    'captureCreation.status.failed': `Failed`,
    'captureCreation.status.success': `Success!`,
};

const Captures: ResolvedIntlConfig['messages'] = {
    'capturesTable.title': `Your Captures`,
    'capturesTable.detailsCTA': `Details`,
};

const MaterializationCreate: ResolvedIntlConfig['messages'] = {
    'materializationCreation.heading': `New Materialization`,
    'materializationCreation.instructions': `To get started please provide a unique name, select an endpoint type, and select the Collections you want to Materialize. After that you can review the YAML before saving.`,
};

const enUSMessages: ResolvedIntlConfig['messages'] = {
    ...CommonMessages,
    ...BrowserTitles,
    ...RouteTitles,
    ...LogsDialog,
    ...AdminPage,
    ...Error,
    ...LoginPage,
    ...Captures,
    ...CaptureCreate,
    ...MaterializationCreate,
};

export default enUSMessages;
