// We DO NOT need this file sorted as it makes it easier for folks to update/see changes
import { ResolvedIntlConfig } from 'react-intl/src/types';

const CommonMessages: ResolvedIntlConfig['messages'] = {
    // Misc
    'company': `Estuary`,
    'productName': `Control Plane`,
    'common.browserTitle': `Flow`,
    'common.loading': `loading...`,
    'common.running': `running...`,
    'common.fail': `Failed`,
    'common.success': `Success`,
    'common.errors.heading': `Error`,
    'common.optionsMissing': `No options`,
    'common.noData': `No data to display`,
    'common.loggedOut': `You have been logged out. Please log back in.`,
    'common.missing': `N/A`,

    // Aria
    'aria.openExpand': `show more`,
    'aria.closeExpand': `show less`,

    // Terms
    'terms.connectors': `Connectors`,

    // Common fields
    'entityName.label': `Name`,
    'entityName.description': `Name of the entity - must be unique. (ex: acemCo/marketing_data)`,
    'connector.label': `Connector`,
    'connector.description': `The connector you want to use to connect to your endpoint.`,
};

const CTAs: ResolvedIntlConfig['messages'] = {
    'cta.addToChangeSet': `Add to Change Set`,
    'cta.cancel': `Cancel`,
    'cta.close': `Close`,
    'cta.continue': `Continue`,
    'cta.delete': `Delete`,
    'cta.download': `Download`,
    'cta.login': `Login`,
    'cta.logout': `Logout`,
    'cta.register': `Sign Up`,
    'cta.clickHere': `click here`,
    'cta.details': `Details`,
    'cta.saveEntity': `Save and Publish`,
    'cta.restart': `Restart`,
};

const Data: ResolvedIntlConfig['messages'] = {
    'data.name': `Name`,
    'data.fullName': `Full Name`,
    'data.description': `Description`,
    'data.status': `Status`,
    'data.type': `Type`,
    'data.maintainer': `Maintainer`,
    'data.updated_at': `Updated`,
    'data.email': `Email`,
    'data.display_name': `User Name`,
};

const Error: ResolvedIntlConfig['messages'] = {
    'error.title': `Error`,
    'error.message': `This is not something you did wrong. There was a technical issue fetching data. Please contact support.`,
    'error.codeLabel': `Code:`,
    'error.messageLabel': `Message:`,
    'error.detailsLabel': `Details:`,
    'error.hintLabel': `Hint:`,
};

const ErrorBoundry: ResolvedIntlConfig['messages'] = {
    'errorBoundry.title': `${Error['error.title']}`,
    'errorBoundry.message1': `Sorry - there was an unexpected error in some UI code. `,
    'errorBoundry.message2': `Expand to see more details.`,
};

const ConfirmationDialog: ResolvedIntlConfig['messages'] = {
    'confirm.title': `Are you sure?`,
    'confirm.loseData': `You have unsaved worked. If you continue you will lose your changes.`,
};

const FullPage: ResolvedIntlConfig['messages'] = {
    'fullpage.error': `Major Error`,
};

const Navigation: ResolvedIntlConfig['messages'] = {
    'navigation.ariaLabel': `Main application navigation`,
    'header.openNavigation.ariaLabel': `Expand Navigation`,
};

const Header: ResolvedIntlConfig['messages'] = {
    'helpMenu.ariaLabel': `Open Help Menu`,
    'helpMenu.tooltip': `Helpful Links`,
    'helpMenu.docs': `Flow Docs`,
    'helpMenu.docs.link': `https://docs.estuary.dev/`,
    'helpMenu.slack': `Estuary's Slack`,
    'helpMenu.slack.link': `https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ`,
    'helpMenu.support': `Email Support`,
    'helpMenu.support.link': `mailto: flow-support@estuary.dev`,
    'helpMenu.contact': `Contact Us`,
    'helpMenu.contact.link': `https://www.estuary.dev/#get-in-touch`,
    'helpMenu.about': `About ${CommonMessages.productName}`,

    'accountMenu.ariaLabel': `Open Account Menu`,
    'accountMenu.tooltip': `Account Menu`,
    'accountMenu.emailVerified': `verified`,
};

const Home: ResolvedIntlConfig['messages'] = {
    'home.main.header': `Welcome to Flow!`,
    'home.main.description': `Click the Capture link over on the side navigation to get started.`,
};

const PageNotFound: ResolvedIntlConfig['messages'] = {
    'pageNotFound.heading': `Sorry, that page cannot be found.`,
    'pageNotFound.message': `Try searching for a page below or go directly to your {dashboard}.`,
};

const Registration: ResolvedIntlConfig['messages'] = {
    'register.heading': `We're currently accepting Beta partners.`,
    'register.main.message': `Please enter your information and our team will approve your account.`,
    'register.label.fullName': `Full Name`,
    'register.label.email': `Email`,
    'register.label.company': `Company`,
    'register.label.intendedUse': `Describe your use case`,
    'register.label.documentAcknowledgement': `Accept our {terms} and {privacy}`,
    'register.label.documentAcknowledgement.terms': `Terms of Service`,
    'register.label.documentAcknowledgement.privacy': `Privacy Policy`,
    'register.existingAccount': `Already have an account?`,
};

const EntityTable: ResolvedIntlConfig['messages'] = {
    'entityTable.title': `Entity Table`,

    'entityTable.filterLabel': `Filter Namespaces`,
    'entityTable.data.entity': `Name`,
    'entityTable.data.connectorType': `Type`,
    'entityTable.data.lastUpdated': `Last Updated`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.writesTo': `Writes To`,
    'entityTable.data.readsFrom': `Reads From`,

    'entityTable.unmatchedFilter.header': `Sorry, no result found.`,
    'entityTable.unmatchedFilter.message': `We could not find any data matching that filter. Try applying a different filter or using an alternative query option.`,

    'entityTable.technicalDifficulties.header': `Sorry, there was an issue getting your data.`,
    'entityTable.technicalDifficulties.message': `We apologize for the inconvenience. A message describing the issue can be found at the top of the page.`,
};

const RouteTitles: ResolvedIntlConfig['messages'] = {
    'routeTitle.home': `Home`,
    'routeTitle.dashboard': `Dashboard`,
    'routeTitle.admin': `Admin`,
    'routeTitle.captureCreate': `Create Capture`,
    'routeTitle.captureDetails': `Capture Details`,
    'routeTitle.captures': `Captures`,
    'routeTitle.collections': `Collections`,
    'routeTitle.connectors': `Connectors`,
    'routeTitle.error.pageNotFound': `Page Not Found`,
    'routeTitle.login': `Login`,
    'routeTitle.loginLoading': `Checking Credentials`,
    'routeTitle.materializationCreate': `Materialization Create`,
    'routeTitle.materializationEdit': `Materialization Edit`,
    'routeTitle.materializations': `Materializations`,
    'routeTitle.registration': `Registration`,
};

const BrowserTitles: ResolvedIntlConfig['messages'] = {
    'browserTitle.home': `${CommonMessages['common.browserTitle']} · Welcome`,
    'browserTitle.dashboard': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.dashboard']}`,
    'browserTitle.admin': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin']}`,
    'browserTitle.captureCreate': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captureCreate']}`,
    'browserTitle.captureDetails': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captureDetails']}`,
    'browserTitle.captures': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captures']}`,
    'browserTitle.collections': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.collections']}`,
    'browserTitle.connectors': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.connectors']}`,
    'browserTitle.error.pageNotFound': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.error.pageNotFound']}`,
    'browserTitle.login': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.login']}`,
    'browserTitle.loginLoading': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.loginLoading']}`,
    'browserTitle.materializationCreate': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializationCreate']}`,
    'browserTitle.materializationEdit': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializationEdit']}`,
    'browserTitle.materializations': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializations']}`,
    'browserTitle.registration': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.registration']}`,
};

const LogsDialog: ResolvedIntlConfig['messages'] = {
    'logs.default': `waiting for logs...`,
    'logs.toManyEmpty': `Logs may have ended. To restart fetching click ${CommonMessages['cta.restart']}.`,
};

const AdminPage: ResolvedIntlConfig['messages'] = {
    'admin.header': `Administration`,
    'admin.roles': `Your ?Roles?`,
    'admin.roles.message': `Below is a list of all the ?roles? that you have access to.`,
    'admin.accessToken': `Access Token`,
    'admin.accessToken.message': `If you want to use the CLI client you will need an access token. You can copy the one below to use.`,
};

const ConnectorsPage: ResolvedIntlConfig['messages'] = {
    'connectorTable.title': `Installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.title.aria': `Table of all installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.filterLabel': `Filter Name or Detail`,
    'connectorTable.data.title': `Name`,
    'connectorTable.data.image_name': `Image`,
    'connectorTable.data.detail': `Details`,
    'connectorTable.data.protocol': `Protocol`,
    'connectorTable.data.updated_at': `Last Changed`,
    'connectorTable.data.documentation_url': `Documentation`,
    'connectorTable.data.external_url': `Homepage`,
    'connectorTable.data.actions': `Actions`,
    'connectorTable.actionsCta.capture': `Capture`,
    'connectorTable.actionsCta.materialization': `Materialization`,
    'connectors.header': `Connectors`,
    'connectors.main.message1': `There are no connectors currently ready to be used.`,
    'connectors.main.message2': `Please contact support to get help setting up a {docLink}.`,
    'connectors.main.message2.docLink': `connector`,
    'connectors.main.message2.docPath': `https://docs.estuary.dev/concepts/#connectors`,
};

const LoginPage: ResolvedIntlConfig['messages'] = {
    'login.main.message': `When running locally you can login with whatever name you want.`,
    'login.oidc.message': `Please use one of the providers below to continue.`,
};

const Captures: ResolvedIntlConfig['messages'] = {
    'captureTable.header': `Captures`,
    'capturesTable.title': `Your Captures`,
    'capturesTable.cta.new': `New Capture`,
    'captures.message1': `Click the "New Capture" button up above to get started.`,
    'captures.message2': `It will guide you through generating and downloading a valid {docLink}.`,
    'captures.message2.docLink': `capture spec`,
    'captures.message2.docPath': `https://docs.estuary.dev/concepts/#captures`,
};

const Materializations: ResolvedIntlConfig['messages'] = {
    'materializationsTable.title': `Materializations`,
    'materializationsTable.cta.new': `New Materialization`,
    'materializations.message1': `Click the "New Materialization" button up above to get started.`,
    'materializations.message2': `It will guide you through generating and downloading a valid {docLink}.`,
    'materializations.message2.docLink': `materialization`,
    'materializations.message2.docPath': `https://docs.estuary.dev/concepts/materialization/`,
};

const Collections: ResolvedIntlConfig['messages'] = {
    'collectionsTable.title': `Collections`,
    'collectionsTable.detailsCTA': `Details`,
    'collections.message1': `You currently have no Collections. Click the Capture link over on the side navigation to get started.`,
    'collections.message2': `Captures connect to outside systems, pull in data, and generate {docLink} within Flow.`,
    'collections.message2.docLink': `collections`,
    'collections.message2.docPath': `https://docs.estuary.dev/concepts/collections/`,
};

const Foo: ResolvedIntlConfig['messages'] = {
    'foo.ctas.discover': `Test Config`,
    'foo.ctas.discoverAgain': `Regenerate Catalog`,
    'foo.ctas.docs': `Connector Docs`,
};

const CaptureCreate: ResolvedIntlConfig['messages'] = {
    'captureCreation.heading': `${RouteTitles['routeTitle.captureCreate']}`,
    'captureCreation.details.heading': `Capture Details`,
    'captureCreation.instructions': `To get started please provide a unique name and the source type of the Capture you want to create. Once you've filled out the source details you can click "Test Capture" down below to test the connection.`,
    'captureCreation.missingConnectors': `No connectors installed. You must install a source connector before being able to create a capture.`,
    'captureCreation.tenant.label': `Tenant`,
    'captureCreation.config.source.doclink': `Connector Docs`,
    'captureCreation.config.source.homepage': `Home Page`,
    'captureCreation.save.failed': `Capture creation failed. Please see below for details:`,
    'captureCreation.editor.default': `Before you can edit the Capture Catalog you need to fill out the connection config section and click Discover`,
    'captureCreation.finalReview.instructions': `Look over the catalog configuration that was generated. If you want to edit anything you can do that directly in the editor. Once you're ready you can download the file for your local.`,
    'captureCreation.test.waitMessage': `Please wait while we try to connect to this endpoint.`,
    'captureCreation.test.failedErrorTitle': `Config Test Failed`,
    'captureCreation.test.serverUnreachable': `Config Test was unable to reach server`,
    'captureCreation.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreation.save.serverUnreachable': `Config Save was unable to reach server`,
    'captureCreation.save.waitMessage': `Please wait while we test, save, and publish your capture.`,
};

const CaptureDetails: ResolvedIntlConfig['messages'] = {
    'captureDetails.logs.title': `Logs`,
};

const MaterializationCreate: ResolvedIntlConfig['messages'] = {
    'materializationCreation.details.heading': `Materialization Details`,
    'materializationCreation.config.source.doclink': `Connector Docs`,
    'materializationCreation.cta.test': `Test Config`,
    'materializationCreation.editor.default': `Before you can edit the Materialization Catalog you need to fill out the connection config section`,
    'materializationCreation.finalReview.instructions': `Look over the catalog configuration that was generated. If you want to edit anything, you can do that directly in the editor. You can download the file for your local machine when you're ready.`,
    'materializationCreation.heading': `New Materialization`,
    'materializationCreation.instructions': `To get started, please provide a unique name and select an endpoint. Next, configure your endpoint and choose the collections you want to materialize. The generated YAML can be reviewed before saving.`,
    'materializationCreation.missingConnectors': `No connectors installed. A source connector must be installed before a materialization can be created.`,
    'materializationCreation.save.failure': `Materialization creation failed. Please see below for details:`,
    'materializationCreation.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationCreation.save.inProgress': `Please wait while we test, save, and publish your materialization.`,
    'materializationCreation.save.serverUnreachable': `Config Save was unable to reach server`,
    'materializationCreation.tenant.label': `Tenant`,
    'materializationCreation.test.failure.errorTitle': `Config Test Failed`,
    'materializationCreation.test.serverUnreachable': `Config Test was unable to reach server`,
    'materializationCreation.test.inProgress': `Please wait while we try to connect to this endpoint.`,
};

const enUSMessages: ResolvedIntlConfig['messages'] = {
    ...CommonMessages,
    ...CTAs,
    ...Data,
    ...ErrorBoundry,
    ...BrowserTitles,
    ...RouteTitles,
    ...FullPage,
    ...Header,
    ...Navigation,
    ...ConfirmationDialog,
    ...LogsDialog,
    ...EntityTable,
    ...Home,
    ...PageNotFound,
    ...Registration,
    ...AdminPage,
    ...ConnectorsPage,
    ...Error,
    ...LoginPage,
    ...Collections,
    ...Materializations,
    ...Foo,
    ...Captures,
    ...CaptureCreate,
    ...CaptureDetails,
    ...MaterializationCreate,
};

export default enUSMessages;
