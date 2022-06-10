// We DO NOT need this file sorted as it makes it easier for folks to update/see changes
import { ResolvedIntlConfig } from 'react-intl/src/types';

const CommonMessages: ResolvedIntlConfig['messages'] = {
    // Misc
    'company': `Estuary`,
    'productName': `Estuary Flow`,
    'common.browserTitle': `Flow`,
    'common.loading': `Loading...`,
    'common.running': `Running...`,
    'common.deleting': `Deleting...`,
    'common.deleted': `Deleted`,
    'common.enabling': `Enabling...`,
    'common.enabled': `Enabled`,
    'common.disabling': `Disabling...`,
    'common.disabled': `Disabled`,
    'common.inProgress': `In Progress`,
    'common.done': `Done`,
    'common.saving': `Saving`,
    'common.saved': `Saved`,
    'common.invalid': `Invalid`,
    'common.fail': `Failed`,
    'common.success': `Success`,
    'common.errors.heading': `Error`,
    'common.optionsMissing': `No options`,
    'common.noData': `No data to display`,
    'common.loggedOut': `You have been logged out. Please log back in.`,
    'common.missing': `N/A`,
    'common.noUnDo': `This action cannot be undone.`,
    'common.version': `version`,

    // Aria
    'aria.openExpand': `show more`,
    'aria.closeExpand': `show less`,

    // Terms
    'terms.connectors': `Connectors`,
    'terms.collections': `Collections`,
    'terms.permissions': `Access Grants`,
    'terms.materialization': `Materialization`,
    'terms.capture': `Capture`,

    // Common fields
    'entityPrefix.label': `Prefix`,
    'entityPrefix.description': `Prefix for the entity name.`,
    'entityName.label': `Name`,
    'entityName.description': `Select a prefix from the drop-down and add a unique name. (ex: acmeCo/marketing_data)`,
    'connector.label': `Connector`,
    'connector.description': `Choose the external system you're connecting to.`,
    'description.label': `Details`,
    'description.description': `Describe your changes or why you're changing things.`,

    // Common sections
    'connectionConfig.header': `Connection Config`,

    'commin.pathShort.prefix': '.../{path}',
};

const CTAs: ResolvedIntlConfig['messages'] = {
    'cta.addToChangeSet': `Add to change set`,
    'cta.cancel': `Cancel`,
    'cta.close': `Close`,
    'cta.continue': `Continue`,
    'cta.delete': `Delete`,
    'cta.download': `Download`,
    'cta.login': `Login`,
    'cta.logout': `Logout`,
    'cta.materialize': `Materialize`,
    'cta.register': `Sign up`,
    'cta.resetPassword': `Reset Password`,
    'cta.magicLink': `Login with magic link`,
    'cta.clickHere': `Click here`,
    'cta.details': `Details`,
    'cta.saveEntity': `Save and publish`,
    'cta.restart': `Restart`,
    'cta.enable': `Enable`,
    'cta.disable': `Disable`,
    'cta.testConfig': `Test Catalog`,
    'cta.generateCatalog': `Generate Catalog`,
    'cta.regenerateCatalog': `Regenerate Catalog`,
};

const Data: ResolvedIntlConfig['messages'] = {
    'data.name': `Name`,
    'data.fullName': `Full name`,
    'data.description': `Description`,
    'data.status': `Status`,
    'data.type': `Type`,
    'data.maintainer': `Maintainer`,
    'data.updated_at': `Updated`,
    'data.email': `Email`,
    'data.display_name': `Username`,
};

const Error: ResolvedIntlConfig['messages'] = {
    'error.title': `Error`,
    'error.message': `This is not something you did wrong. There was a technical issue fetching data. Please {docLink}.`,
    'error.message.docLink': `contact support`,
    'error.message.docPath': `mailto:support@estuary.dev`,
    'error.codeLabel': `Code:`,
    'error.messageLabel': `Message:`,
    'error.detailsLabel': `Details:`,
    'error.hintLabel': `Hint:`,
    'error.descriptionLabel': `Description:`,
};

const ErrorBoundry: ResolvedIntlConfig['messages'] = {
    'errorBoundry.title': `${Error['error.title']}`,
    'errorBoundry.message1': `There was an unexpected application error. `,
    'errorBoundry.message2': `Expand to see details.`,
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
    'mainMenu.tooltip': `Open Main Menu`,

    'helpMenu.ariaLabel': `Open Help Menu`,
    'helpMenu.tooltip': `Helpful Links`,
    'helpMenu.docs': `Flow Docs`,
    'helpMenu.docs.link': `https://docs.estuary.dev/`,
    'helpMenu.slack': `Estuary Slack`,
    'helpMenu.slack.link': `https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ`,
    'helpMenu.support': `Email Support`,
    'helpMenu.support.link': `mailto: flow-support@estuary.dev`,
    'helpMenu.contact': `Contact Us`,
    'helpMenu.contact.link': `https://www.estuary.dev/#get-in-touch`,
    'helpMenu.about': `About ${CommonMessages.productName}`,

    'accountMenu.ariaLabel': `Open Account Menu`,
    'accountMenu.tooltip': `My Account`,
    'accountMenu.emailVerified': `verified`,

    'modeSwitch.label': `Color Mode`,
};

const Home: ResolvedIntlConfig['messages'] = {
    'home.main.header': `Welcome to Flow!`,
    'home.main.description': `Click the Captures icon on the menu bar to get started.`,
};

const PageNotFound: ResolvedIntlConfig['messages'] = {
    'pageNotFound.heading': `Sorry, that page cannot be found.`,
    'pageNotFound.message': `Try searching for a page below or go directly to your {dashboard}.`,
};

// TODO (password reset) not active
const PasswordReset: ResolvedIntlConfig['messages'] = {
    'passwordReset.heading': `Password Reset`,
    'passwordReset.main': `Enter your new password below.`,
    'email.description': `The email address associated with your ${CommonMessages.productName} Account`,
    'email.label': `Email`,
    'password.description': `Pleasae provide a safe and secure password`,
    'password.label': `Password`,
    'confirmPassword.label': `Confirm Password`,
};

const Registration: ResolvedIntlConfig['messages'] = {
    'register.heading': `We're currently accepting Beta partners.`,
    'register.main.message': `Please enter your information and our team will approve your account.`,
    'register.label.fullName': `Full Name`,
    'register.label.email': `Email`,
    'register.label.company': `Company`,
    'register.label.intendedUse': `Describe your use case.`,
    'register.label.documentAcknowledgement': `Accept our {terms} and {privacy}`,
    'register.label.documentAcknowledgement.terms': `Terms of Service`,
    'register.label.documentAcknowledgement.privacy': `Privacy Policy`,
    'register.existingAccount': `Already have an account?`,
};

const LoginPage: ResolvedIntlConfig['messages'] = {
    'login.oidc.message': `Sign in to continue to ${CommonMessages.productName}.`,
    'login.documentAcknowledgement': `By accessing ${CommonMessages.productName} you agree to our {terms} and {privacy}.`,
    'login.jwtExpired': 'Your authorization has expired. Please sign in again.',

    'login.passwordReset': 'You should not need to reset your password.',

    'login.magicLink': 'Check your email for link.',
    'login.magicLink.failed': 'Failed. Please try again.',
    'login.email.description': `Any valid email you want to use to sign in with`,
    'login.email.label': `Email`,

    'login.separator': 'or',
    'login.loginFailed.google': 'Failed to sign in with Google',
    'login.userNotFound': 'User not found. Please sign up below.',
};

const EntityStatus: ResolvedIntlConfig['messages'] = {
    'entityStatus.green': `Running`,
    'entityStatus.yellow': `Alerts`,
    'entityStatus.red': `Stopped`,
};

const EntityTable: ResolvedIntlConfig['messages'] = {
    'entityTable.title': `Entity Table`,

    'entityTable.data.entity': `Name`,
    'entityTable.data.connectorType': `Type`,
    'entityTable.data.lastUpdated': `Last Updated`,
    'entityTable.data.lastPublished': `Published`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.writesTo': `Writes To`,
    'entityTable.data.readsFrom': `Reads From`,
    'entityTable.data.status': `Status`,
    'entityTable.data.userFullName': `User`,
    'entityTable.data.capability': `Capability`,
    'entityTable.data.objectRole': `Object`,
    'entityTable.data.lastPubUserFullName': `Published By`,

    'entityTable.unmatchedFilter.header': `No results found.`,
    'entityTable.unmatchedFilter.message': `We couldn't find any data matching your search. Please try a different filter.`,

    'entityTable.technicalDifficulties.header': `There was an issue getting your data.`,
    'entityTable.technicalDifficulties.message': `We apologize for the inconvenience. You'll find a message describing the issue at the top of the page.`,
};

const RouteTitles: ResolvedIntlConfig['messages'] = {
    'routeTitle.home': `Home`,
    'routeTitle.dashboard': `Dashboard`,
    'routeTitle.admin': `Admin`,
    'routeTitle.captureCreate': `Create Capture`,
    'routeTitle.captures': `Captures`,
    'routeTitle.collections': `Collections`,
    'routeTitle.connectors': `Connectors`,
    'routeTitle.error.pageNotFound': `Page Not Found`,
    'routeTitle.login': `Login`,
    'routeTitle.loginLoading': `Checking Credentials`,
    'routeTitle.noGrants': `Access Denied`,
    'routeTitle.materializationCreate': `Create Materialization`,
    'routeTitle.materializations': `Materializations`,
    'routeTitle.registration': `Registration`,
    'routeTitle.passwordReset': `Password Reset`,
};

const BrowserTitles: ResolvedIntlConfig['messages'] = {
    'browserTitle.home': `${CommonMessages['common.browserTitle']} · Welcome`,
    'browserTitle.dashboard': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.dashboard']}`,
    'browserTitle.admin': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin']}`,
    'browserTitle.captureCreate': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captureCreate']}`,
    'browserTitle.captures': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captures']}`,
    'browserTitle.collections': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.collections']}`,
    'browserTitle.connectors': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.connectors']}`,
    'browserTitle.error.pageNotFound': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.error.pageNotFound']}`,
    'browserTitle.login': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.login']}`,
    'browserTitle.noGrants': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.noGrants']}`,
    'browserTitle.loginLoading': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.loginLoading']}`,
    'browserTitle.materializationCreate': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializationCreate']}`,
    'browserTitle.materializations': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializations']}`,
    'browserTitle.registration': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.registration']}`,
    'browserTitle.passwordReset': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.passwordReset']}`,
};

const LogsDialog: ResolvedIntlConfig['messages'] = {
    'logs.default': `Waiting for logs...`,
    'logs.toManyEmpty': `Logs for this build may have ended. Click ${CTAs['cta.restart']} to check for new logs.`,
};

const AdminPage: ResolvedIntlConfig['messages'] = {
    'admin.header': `Administration`,
    'admin.roles.message': `These are all the ${CommonMessages['terms.permissions']} that are currently provisioned. An administrator can update them in the {docLink}.`,
    'admin.roles.message.docLink': `authorization settings`,
    'admin.roles.message.docPath': `https://go.estuary.dev/provision`,
    'admin.accessToken': `Access Token`,
    'admin.accessToken.message': `Copy the access token below to authenticate the CLI client.`,
};

const AccessGrants: ResolvedIntlConfig['messages'] = {
    'accessGrantsTable.header': `Captures`,
    'accessGrantsTable.title': `${CommonMessages['terms.permissions']}`,
    'accessGrantsTable.filterLabel': `Filter User or Object`,
    'accessGrants.message1': `No results found.`,
    'accessGrants.message2': `We couldn't find any results matching your search. Please try a different filter.`,
};

const ConnectorsPage: ResolvedIntlConfig['messages'] = {
    'connectorTable.title': `Installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.title.aria': `Table of all installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.filterLabel': `Search connectors`,
    'connectorTable.data.title': `Name`,
    'connectorTable.data.image_name': `Image`,
    'connectorTable.data.detail': `Details`,
    'connectorTable.data.protocol': `Protocol`,
    'connectorTable.data.updated_at': `Last Updated`,
    'connectorTable.data.documentation_url': `Documentation`,
    'connectorTable.data.external_url': `Homepage`,
    'connectorTable.data.actions': `Actions`,
    'connectorTable.actionsCta.capture': `Capture`,
    'connectorTable.actionsCta.materialization': `Materialization`,
    'connectors.header': `Connectors`,
    'connectors.main.message1': `There are no connectors available matching your search.`,
    'connectors.main.message2': `If you'd like to request a connector for a system that isn't yet supported, {docLink}.`,
    'connectors.main.message2.docLink': `contact Estuary`,
    'connectors.main.message2.docPath': `https://www.estuary.dev/#get-in-touch`,
};

const NoGrants: ResolvedIntlConfig['messages'] = {
    'noGrants.main.message': `Thanks for signing up. Our team is reviewing your account and will get back to you shortly.`,
};

const Captures: ResolvedIntlConfig['messages'] = {
    'captureTable.header': `Captures`,
    'capturesTable.title': `Your Captures`,
    'capturesTable.cta.new': `New Capture`,
    'capturesTable.filterLabel': `Filter captures`,
    'capturesTable.disableEnable.confirm': `All items listed below will be {setting}.`,
    'capturesTable.delete.confirm': `All items listed below will be deleted forever. Please review before continuing.`,
    'capturesTable.ctaGroup.aria': `capture table available actions`,
    'capturesTable.cta.materialize': `${CTAs['cta.materialize']} ${CommonMessages['terms.collections']}`,
    'captures.message1': `Click "New Capture" to get started.`,
    'captures.message2': `You'll be guided through the process of defining, testing, and publishing a {docLink}.`,
    'captures.message2.docLink': `capture`,
    'captures.message2.docPath': `https://docs.estuary.dev/concepts/#captures`,
    'captureCreate.status.success': `${CommonMessages['common.success']}`,
};

const Materializations: ResolvedIntlConfig['messages'] = {
    'materializationsTable.title': `Materializations`,
    'materializationsTable.cta.new': `New Materialization`,
    'materializationsTable.filterLabel': `Filter materializations`,
    'materializations.message1': `Click "New Materialization" to get started.`,
    'materializations.message2': `You'll be guided through the process of defining, testing, and publishing a {docLink}.`,
    'materializations.message2.docLink': `materialization`,
    'materializations.message2.docPath': `https://docs.estuary.dev/concepts/materialization/`,
};

const Collections: ResolvedIntlConfig['messages'] = {
    'collectionsTable.title': `Collections`,
    'collectionsTable.detailsCTA': `Details`,
    'collectionsTable.filterLabel': `Filter collections`,
    'collections.message1': `You currently have no collections. Click the Captures icon on the menu bar to get started.`,
    'collections.message2': `Captures connect to outside systems, pull in data, and generate {docLink} within Flow.`,
    'collections.message2.docLink': `collections`,
    'collections.message2.docPath': `https://docs.estuary.dev/concepts/collections/`,
};

const Foo: ResolvedIntlConfig['messages'] = {
    'foo.ctas.docs': `Connector Help`,
    'foo.catalogEditor.heading': `Catalog Editor`,
    'foo.errors.collapseTitle': `Expand to see logs`,
    'foo.endpointConfig.heading': `Connection Configuration`,
    'foo.endpointConfig.errorSummary': `You must provide valid values for all required fields before continuing.`,
    'foo.endpointConfig.detailsHaveErrors': `The Details section has errors.`,
    'foo.endpointConfig.entityNameMissing': `Provide a name to continue.`,
    'foo.endpointConfig.connectorMissing': `Select a connector to continue.`,
    'foo.endpointConfig.endpointConfigMissing': `The Connection Configuration section is empty.`,
    'foo.endpointConfig.endpointConfigHaveErrors': `The Connection Configuration section has errors.`,
    'foo.endpointConfig.resourceConfigHaveErrors': `The Collections Resource Configuration section has errors.`,
    'foo.endpointConfig.collectionsMissing': `Select a collection to continue.`,
};

const MonacoEditor: ResolvedIntlConfig['messages'] = {
    'monacoEditor.serverDiff': `Your version is out of sync with the server.`,
    'monacoEditor.serverDiffCTA': `See changes`,
};

const CaptureCreate: ResolvedIntlConfig['messages'] = {
    'captureCreate.heading': `${RouteTitles['routeTitle.captureCreate']}`,
    'captureCreate.details.heading': `Capture Details`,
    'captureCreate.ctas.materialize': `Materialize Collections`,
    'captureCreate.instructions': `Provide a unique name and specify a source system for your capture. Fill in the required details and click "Test Configuration" to test the connection.`,
    'captureCreate.missingConnectors': `No connectors are installed. You must install a source connector to create a capture.`,
    'captureCreate.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']} to create a capture. Please contact an administrator.`,
    'captureCreate.tenant.label': `Prefix`,
    'captureCreate.config.source.doclink': `Connector Help`,
    'captureCreate.config.source.homepage': `Home`,
    'captureCreate.save.failed': `Capture creation failed. See below for details:`,
    'captureCreate.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "Test Configuration." `,
    'captureCreate.finalReview.instructions': `The following catalog was generated from the details you provided. To make changes, you can enter new values in the form above and click Regenenerate Catalog, or you can edit the YAML file directly. Click Save and Publish to proceed.`,

    'captureCreate.test.failedErrorTitle': `Configuration Test Failed`,
    'captureCreate.test.serverUnreachable': `Unable to reach server while testing configuration.`,

    'captureCreate.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreate.save.serverUnreachable': `Unable to reach server while saving capture`,
    'captureCreate.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureCreate.generate.failedConfigEncryptTitle': `Configuration Encryption Failed`,
    'captureCreate.generate.failedErrorTitle': `Generating Catalog Failed`,

    'captureCreate.createNotification.title': `New Capture Created`,
    'captureCreate.createNotification.desc': `Your new capture is published and ready to be used.`,

    'captureCreate.test.waitMessage': `Please wait while we test your capture.`,
    'captureCreate.testNotification.title': `Test Successful`,
    'captureCreate.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,
};

const DetailsPanel: ResolvedIntlConfig['messages'] = {
    'detailsPanel.logs.title': `Logs`,
    'detailsPanel.logs.notFound': `Logs for this build cannot be found. This is likely a permissions issue. You don't have permissions to view other users' logs by default.`,
    'detailsPanel.shardDetails.title': `Shard Information`,
    'detailsPanel.shardDetails.status.label': `Status`,
    'detailsPanel.shardDetails.id.label': `ID`,
    'detailsPanel.shardDetails.errorTitle': `Shard Replica Processing Errors`,
    'detailsPanel.shardDetails.docLink': `Shard Help`,
    'detailsPanel.shardDetails.docPath': `https://docs.estuary.dev/concepts/advanced/shards/`,
};

const MaterializationCreate: ResolvedIntlConfig['messages'] = {
    'materializationCreate.details.heading': `Materialization Details`,
    'materializationCreate.collections.heading': `Output Collections`,
    'materializationCreate.config.source.doclink': `Connector Help`,
    'materializationCreate.cta.test': `Test Configuration`,
    'materializationCreate.editor.default': `Before you can edit the materialization specification, you must fill out the Connection Configuration section and click "Test Configuration".`,
    'materializationCreate.finalReview.instructions': `The following catalog was generated from the details you provided. To make changes, you can enter new values in the form above and click Regenenerate Catalog, or you can edit the YAML file directly. Click Save and Publish to proceed.`,
    'materializationCreate.heading': `New Materialization`,
    'materializationCreate.instructions': `Provide a unique name and specify a destination system for your materialization. Fill in the required details and click "Test Configuration".`,
    'materializationCreate.missingConnectors': `No connectors installed. A materialization connector must be installed before a materialization can be created.`,
    'materializationCreate.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']} to create a materialization. Please contact an administrator.`,
    'materializationCreate.save.failure': `Materialization creation failed. See below for details:`,
    'materializationCreate.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationCreate.save.serverUnreachable': `Unable to reach server while saving materialization`,
    'materializationCreate.tenant.label': `Prefix`,

    'materializationCreate.test.failure.errorTitle': `Configuration Test Failed`,
    'materializationCreate.test.failedConfigEncryptTitle': `Configuration Encryption Failed`,
    'materializationCreate.test.serverUnreachable': `Unable to reach server while testing configuration`,
    'materializationCreate.test.inProgress': `Please wait while we try to connect to the destination.`,

    'materializationCreate.collectionSelector.heading': `Collection Selector`,
    'materializationCreate.collectionSelector.instructions': `Choose one or more collections to materialize.`,

    'materializationCreate.resourceConfig.heading': `Resource Configuration`,
    'materializationCreate.save.failedErrorTitle': `Materialization Save Failed`,
    'materializationCreate.save.waitMessage': `Please wait while we test, save, and publish your materialization.`,

    'materializationCreate.createNotification.title': `New Materialization Created`,
    'materializationCreate.createNotification.desc': `Your materialization is published and ready to be used.`,

    'materializationCreate.test.waitMessage': `Please wait while we test your materialization.`,
    'materializationCreate.testNotification.title': `Test Successful`,
    'materializationCreate.testNotification.desc': `Your materialization succeeded in a dry run and can be saved.`,
};

const ShardStatus: ResolvedIntlConfig['messages'] = {
    'shardStatus.primary': `PRIMARY`,
    'shardStatus.failed': `FAILED`,
    'shardStatus.idle': `IDLE`,
    'shardStatus.standby': `STANDBY`,
    'shardStatus.backfill': `BACKFILL`,
    'shardStatus.disabled': `DISABLED`,
    'shardStatus.none': `No shard status found.`,
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
    ...EntityStatus,
    ...EntityTable,
    ...Home,
    ...PageNotFound,
    ...PasswordReset,
    ...Registration,
    ...AdminPage,
    ...MonacoEditor,
    ...ConnectorsPage,
    ...Error,
    ...NoGrants,
    ...LoginPage,
    ...AccessGrants,
    ...Collections,
    ...Materializations,
    ...Foo,
    ...Captures,
    ...CaptureCreate,
    ...DetailsPanel,
    ...MaterializationCreate,
    ...ShardStatus,
};

export default enUSMessages;
