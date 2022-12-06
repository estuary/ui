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
    'common.optionsAll': `All`,
    'common.optionsMissing': `No options`,
    'common.noData': `No data to display`,
    'common.loggedOut': `You have been logged out. Please log back in.`,
    'common.missing': `N/A`,
    'common.noUnDo': `This action cannot be undone.`,
    'common.version': `version`,
    'common.tenant': `Prefix`,
    'common.recommended': `Recommended`,

    // Aria
    'aria.openExpand': `show more`,
    'aria.closeExpand': `show less`,

    // Terms
    'terms.connectors': `Connectors`,
    'terms.collections': `Collections`,
    'terms.permissions': `Access Grants`,
    'terms.materialization': `Materialization`,
    'terms.capture': `Capture`,
    'terms.documentation': `Docs`,

    // Common fields
    'entityPrefix.label': `Prefix`,
    'entityPrefix.description': `Prefix for the entity name.`,
    'entityName.label': `Name`,
    'entityName.description': `Select a prefix from the drop-down and add a unique name. (ex: acmeCo/marketing_data)`,
    'connector.label': `Connector`,
    'connector.description': `Choose the external system you're connecting to.`,
    'description.label': `Details`,
    'description.description': `Describe your changes or why you're changing things.`,

    // Filter options
    'sortDirection.ascending': `A to Z`,
    'sortDirection.descending': `Z to A`,

    // Common sections
    'connectionConfig.header': `Connection Config`,

    'commin.pathShort.prefix': '.../{path}',

    // Alert messages
    'alert.error': 'Error!',
    'alert.warning': 'Warning!',
    'alert.success': 'Success!',
    'alert.info': 'Important!',

    // Used in directives
    'directives.returning': `Welcome back. You still need to provide some information before using the application.`,

    // User in filters for tables
    'filter.time.today': `Today`,
    'filter.time.yesterday': `Yesterday`,
    'filter.time.lastWeek': `Last Week`,
    'filter.time.thisWeek': `This Week`,
    'filter.time.lastMonth': `Last Month`,
    'filter.time.thisMonth': `This Month`,
};

const CTAs: ResolvedIntlConfig['messages'] = {
    'cta.cancel': `Cancel`,
    'cta.close': `Close`,
    'cta.continue': `Continue`,
    'cta.delete': `Delete`,
    'cta.download': `Download`,
    'cta.edit': `Edit`,
    'cta.login': `Login`,
    'cta.logout': `Logout`,
    'cta.materialize': `Materialize`,
    'cta.register': `Sign up`,
    'cta.resetPassword': `Reset Password`,
    'cta.magicLink': `Sign in with magic link`,
    'cta.verifyOTP': `Sign in with OTP`,
    'cta.clickHere': `Click here`,
    'cta.details': `Details`,
    'cta.preview': `Preview`,
    'cta.saveEntity': `Save and publish`,
    'cta.restart': `Restart`,
    'cta.enable': `Enable`,
    'cta.disable': `Disable`,
    'cta.testConfig': `Test`,
    'cta.generateCatalog.capture': `Next`,
    'cta.generateCatalog.materialization': `Next`,
    'cta.expandToEdit': `Expand to edit`,
    'cta.refresh': `Refresh`,
    'cta.table': `Table`,
    'cta.list': `List`,
    'cta.expandToView': `Expand to view`,
    'cta.login.google': `Sign in with Google`,
    'cta.register.google': `Register with Google`,
    'cta.login.github': `Sign in with GitHub`,
    'cta.register.github': `Register with GitHub`,
    'cta.configure': `Configure`,
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
    'error.message': `This is not something you did wrong. There was a technical issue. Please {docLink}.`,
    'error.message.docLink': `contact support`,
    'error.message.docPath': `mailto:support@estuary.dev`,
    'error.codeLabel': `Code:`,
    'error.messageLabel': `Message:`,
    'error.detailsLabel': `Details:`,
    'error.hintLabel': `Hint:`,
    'error.descriptionLabel': `Description:`,
    'error.tryAgain': `Try again and if the issue persists please contact support.`,
};

const ErrorBoundry: ResolvedIntlConfig['messages'] = {
    'errorBoundry.title': `${Error['error.title']}`,
    'errorBoundry.message1': `There was an unexpected application error. `,
    'errorBoundry.message2': `Expand to see details.`,
};

const ConfirmationDialog: ResolvedIntlConfig['messages'] = {
    'confirm.title': `Are you sure?`,
    'confirm.loseData': `You have unsaved work. If you continue, you will lose your changes.`,
};

const FullPage: ResolvedIntlConfig['messages'] = {
    'fullpage.error': `Major Error`,
};

const Navigation: ResolvedIntlConfig['messages'] = {
    'navigation.toggle.ariaLabel': `Toggle Navigation`,
    'navigation.expand': `Expand Navigation`,
    'navigation.collapse': `Collapse Navigation`,
};

const RouteTitles: ResolvedIntlConfig['messages'] = {
    'routeTitle.home': `Welcome`,
    'routeTitle.dashboard': `Dashboard`,
    'routeTitle.admin': `Admin`,
    'routeTitle.admin.accessGrants': `Access Grants`,
    'routeTitle.admin.api': `CLI - API`,
    'routeTitle.admin.connectors': `Connectors`,
    'routeTitle.admin.cookies': `Cookie Preferences`,
    'routeTitle.captureCreate': `Create Capture`,
    'routeTitle.captureEdit': `Edit Capture`,
    'routeTitle.captures': `Captures`,
    'routeTitle.collections': `Collections`,
    'routeTitle.directives': `Directives`,
    'routeTitle.error.pageNotFound': `Page Not Found`,
    'routeTitle.login': `Login`,
    'routeTitle.loginLoading': `Checking Credentials`,
    'routeTitle.noGrants': `Signed Up`,
    'routeTitle.legal': `Legal`,
    'routeTitle.materializationCreate': `Create Materialization`,
    'routeTitle.materializationEdit': `Edit Materialization`,
    'routeTitle.materializations': `Materializations`,
    'routeTitle.registration': `Registration`,
    'routeTitle.passwordReset': `Password Reset`,
};

const BrowserTitles: ResolvedIntlConfig['messages'] = {
    'browserTitle.home': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.home']}`,
    'browserTitle.dashboard': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.dashboard']}`,
    'browserTitle.admin': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin']}`,
    'browserTitle.admin.accessGrants': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin.accessGrants']}`,
    'browserTitle.admin.api': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin.api']}`,
    'browserTitle.admin.connectors': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin.connectors']}`,
    'browserTitle.admin.cookies': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.admin.cookies']}`,
    'browserTitle.captureCreate': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captureCreate']}`,
    'browserTitle.captureEdit': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captureEdit']}`,
    'browserTitle.captures': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.captures']}`,
    'browserTitle.collections': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.collections']}`,
    'browserTitle.error.pageNotFound': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.error.pageNotFound']}`,
    'browserTitle.login': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.login']}`,
    'browserTitle.noGrants': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.noGrants']}`,
    'browserTitle.legal': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.legal']}`,
    'browserTitle.loginLoading': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.loginLoading']}`,
    'browserTitle.materializationCreate': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializationCreate']}`,
    'browserTitle.materializationEdit': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializationEdit']}`,
    'browserTitle.materializations': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.materializations']}`,
    'browserTitle.registration': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.registration']}`,
    'browserTitle.passwordReset': `${CommonMessages['common.browserTitle']} · ${RouteTitles['routeTitle.passwordReset']}`,
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

    'modeSwitch.label': `Toggle Color Mode`,
};

const Home: ResolvedIntlConfig['messages'] = {
    'home.main.header': `Welcome to Flow!`,
    'home.main.description': `Click the Captures icon on the menu bar to get started.`,

    'home.hero.one.title': `Step 1`,
    'home.hero.one.message': `Start at the {emphasis} page to setup real-time data ingestion from your sources.`,
    'home.hero.one.emphasis': RouteTitles['routeTitle.captures'],

    'home.hero.two.title': `Step 2`,
    'home.hero.two.message': `Flow automatically lands your data in {emphasis} within your cloud storage. `,
    'home.hero.two.emphasis': RouteTitles['routeTitle.collections'],

    'home.hero.three.title': `Step 3`,
    'home.hero.three.message': `Connect to your target systems and keep them up to date with low-latency views of collection data, known as {emphasis}.`,
    'home.hero.three.emphasis': RouteTitles['routeTitle.materializations'],
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
    'register.existingAccount': `Already have an account?`,
};

const LoginPage: ResolvedIntlConfig['messages'] = {
    'login.documentAcknowledgement': `By accessing ${CommonMessages.productName} you agree to our {terms} and {privacy}.`,
    'login.jwtExpired': 'Your authorization has expired. Please sign in again.',

    'login.tabs.login': `Sign In`,
    'login.tabs.register': `Register`,
    'login.login.message': `Sign in to continue to ${CommonMessages.productName}.`,
    'login.register.message': `Please use a provider below to regisiter for a free trial of ${CommonMessages.productName}.`,

    'login.passwordReset': 'You should not need to reset your password.',

    'login.magicLink': 'Magic link sent. Please check your email.',
    'login.magicLink.failed': 'Failed. Please try again.',
    'login.magicLink.verifyOTP': 'Already have an OTP?',
    'login.magicLink.requestOTP': 'Request a magic link',

    'login.email.description': `Any valid email you want to use to sign in with`,
    'login.email.label': `Email`,

    'login.token.description': `This can be found in the magic link email`,
    'login.token.label': `OTP`,

    'login.separator': 'or',
    'login.loginFailed': 'Failed to sign in',
    'login.loginFailed.google': 'Failed to sign in with Google',
    'login.loginFailed.github': 'Failed to sign in with GitHub',
    'login.registerFailed': 'Failed to register',
    'login.registerFailed.google': 'Failed to register with Google',
    'login.registerFailed.github': 'Failed to register with GitHub',
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
    'entityTable.data.lastUpdatedWithColon': `Last Updated:`,
    'entityTable.data.lastPublished': `Published`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.writesTo': `Writes To`,
    'entityTable.data.readsFrom': `Reads From`,
    'entityTable.data.status': `Status`,
    'entityTable.data.userFullName': `User`,
    'entityTable.data.capability': `Capability`,
    'entityTable.data.objectRole': `Object`,
    'entityTable.data.lastPubUserFullName': `Last Updated By`,

    'entityTable.stats.bytes_written_by_me': `Bytes Written`,
    'entityTable.stats.docs_written_by_me': `Docs Written`,
    'entityTable.stats.bytes_read_by_me': `Bytes Read`,
    'entityTable.stats.docs_read_by_me': `Docs Read`,

    'entityTable.stats.bytes_written_to_me': `Bytes Written`,
    'entityTable.stats.docs_written_to_me': `Docs Written`,
    'entityTable.stats.bytes_read_to_me': `Bytes Read`,
    'entityTable.stats.docs_read_to_me': `Docs Read`,

    'entityTable.stats.error': `Failed to fetch stats.`,
    'entityTable.stats.filterMenu': `Stats for {currentOption}`,

    'entityTable.unmatchedFilter.header': `No results found.`,
    'entityTable.unmatchedFilter.message': `We couldn't find any data matching your search. Please try a different filter.`,

    'entityTable.technicalDifficulties.header': `There was an issue getting your data.`,
    'entityTable.technicalDifficulties.message': `We apologize for the inconvenience. You'll find a message describing the issue at the top of the page.`,

    'optionMenu.ariaLabel': `Open Option Menu`,
    'optionMenu.tooltip': `Options`,
    'optionMenu.option.detailsPanel.display': `View details`,
    'optionMenu.option.detailsPanel.hide': `Hide details`,
    'optionMenu.option.edit': `Edit specification`,
};

const LogsDialog: ResolvedIntlConfig['messages'] = {
    'logs.default': `Waiting for logs...`,
    'logs.paused': `paused`,
    'logs.restartLink': `click here`,
    'logs.tooManyEmpty': `Logs for this build may have ended. {restartCTA} to start waiting for new logs again.`,
    'logs.networkFailure': `We encountered a problem streaming logs. Please check your network connection and {restartCTA} to start waiting for new logs again.`,
};

const AdminPage: ResolvedIntlConfig['messages'] = {
    'admin.header': `Administration`,
    'admin.roles.message': `These are all the ${CommonMessages['terms.permissions']} that are currently provisioned. An administrator can update them in the {docLink}.`,
    'admin.roles.message.docLink': `authorization settings`,
    'admin.roles.message.docPath': `https://go.estuary.dev/provision`,
    'admin.accessToken': `Access Token`,
    'admin.accessToken.message': `Copy the access token below to authenticate the CLI client.`,
    'admin.cookies': `Cookie Preference Management`,
    'admin.cookies.message': `Click below to manage your preferences.`,
    'admin.tabs.users': `Users`,
    'admin.tabs.connectors': `Connectors`,
    'admin.tabs.api': `CLI-API`,
    'admin.tabs.cookies': `Cookie Preferences`,
};

const Welcome: ResolvedIntlConfig['messages'] = {
    'welcome.image.alt': `content needed`,
};

const AccessGrants: ResolvedIntlConfig['messages'] = {
    'accessGrantsTable.header': `Captures`,
    'accessGrantsTable.title': `Users`,
    'accessGrantsTable.filterLabel': `Filter User or Object`,
    'accessGrants.message1': `No results found.`,
    'accessGrants.message2': `We couldn't find any results matching your search. Please try a different filter.`,
};

const ConnectorsPage: ResolvedIntlConfig['messages'] = {
    'connectorTable.title': `Installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.title.aria': `Table of all installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.filterLabel': `Search connectors`,
    'connectorTable.label.sortBy': `Sort By`,
    'connectorTable.label.sortDirection': `Sort Direction`,
    'connectorTable.data.title': `Name`,
    'connectorTable.data.image_name': `Image`,
    'connectorTable.data.detail': `Details`,
    'connectorTable.data.protocol': `Protocol`,
    'connectorTable.data.updated_at': `Last Updated`,
    'connectorTable.data.documentation_url': `Documentation`,
    'connectorTable.data.external_url': `Homepage`,
    'connectorTable.data.actions': `Actions`,
    'connectorTable.data.connectorRequest': `New Connector`,
    'connectorTable.actionsCta.capture': `Capture`,
    'connectorTable.actionsCta.materialization': `Materialize`,
    'connectorTable.actionsCta.connectorRequest': `Contact Estuary`,
    'connectors.header': `Connectors`,
    'connectors.main.message1': `There are no connectors available matching your search.`,
    'connectors.main.message2.alt': `To request a connector for a new system, click "Contact Estuary" and submit the form.`,
    'connectors.main.message2': `To request a connector for a system that isn't yet supported, {docLink}.`,
    'connectors.main.message2.docLink': `contact Estuary`,
    'connectors.main.message2.docPath': `https://github.com/estuary/connectors/issues/new?assignees=&labels=new+connector&template=request-new-connector-form.yaml&title=Request+a+connector+to+%5Bcapture+from+%7C+materialize+to%5D+%5Byour+favorite+system%5D`,
};

const NoGrants: ResolvedIntlConfig['messages'] = {
    'noGrants.main.message': `Our team is reviewing your account and will get back to you shortly.`,
    'noGrants.main.title': `Thanks For Signing Up`,
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
    'collectionsPreview.notFound.title': `Not Found`,
    'collectionsPreview.notFound.message': `We were unable to find any data which could mean the Capture has not ingested data yet or is not running. Check the status on the Captures page to make sure it is running.`,
    'collectionsPreview.tooFewDocuments.title': `Low document count`,
    'collectionsPreview.tooFewDocuments.message': `Fewer documents than desired were found. This could mean that your collection isn't seeing very much data.`,
    'collectionsPreview.tooManyBytes.title': `Large documents`,
    'collectionsPreview.tooManyBytes.message': `Exceeded the maximum bytes before reaching the desired number of documents. This probably means that your documents are large.`,
    'collectionsPreview.tooManyBytesAndNoDocuments.title': `Read limit reached`,
    'collectionsPreview.tooManyBytesAndNoDocuments.message': `We reached the limit of how much data a web browser can comfortably read, and didn't find even reach the end of one document! This probably means that your documents are huge.`,
};

const endpointConfigHeader = `Endpoint Config`;
const EntityCreate: ResolvedIntlConfig['messages'] = {
    'entityCreate.catalogEditor.heading': `Specification Editor`,
    'entityCreate.ctas.docs': `Connector Help`,
    'entityCreate.errors.collapseTitle': `View logs`,
    'entityCreate.errors.collapseTitleOpen': `Hide logs`,
    'entityCreate.sops.failedTitle': `Configuration Encryption Failed`,
    'entityCreate.endpointConfig.heading': `${endpointConfigHeader}`,
    'entityCreate.endpointConfig.errorSummary': `There are issues with the form.`,
    'entityCreate.instructions': `To start select a Connector below. Once you make a selection the rest of the form will display and you can configure your endpoint. You can search by name and if you do not find what you are looking for please let us know by requesting the connector.`,

    'entityCreate.endpointConfig.detailsHaveErrors': `The Details section has errors:`,
    'entityCreate.endpointConfig.resourceConfigHaveErrors': `The Output Collections section has errors:`,
    'entityCreate.endpointConfig.endpointConfigHaveErrors': `The ${endpointConfigHeader} section has errors:`,

    'entityCreate.endpointConfig.noConnectorSelectedTitle': `Please select a Connector to begin`,
    'entityCreate.endpointConfig.noConnectorSelected': `To start the creation process you must select a Connector. You can change this later.`,

    'entityCreate.endpointConfig.entityNameMissing': `Name missing`,
    'entityCreate.endpointConfig.connectorMissing': `Connector missing`,
    'entityCreate.endpointConfig.endpointConfigMissing': `${endpointConfigHeader} empty`,
    'entityCreate.endpointConfig.collectionsMissing': `${CommonMessages['terms.collections']} missing`,
    'entityCreate.endpointConfig.resourceConfigInvalid': `Resource Config invalid`,

    'entityCreate.bindingsConfig.collectionsLabel': `Available ${CommonMessages['terms.collections']}`,
    'entityCreate.bindingsConfig.noRows': `Please select from the ${CommonMessages['terms.collections']} above to begin.`,
    'entityCreate.bindingsConfig.noRowsTitle': `No selection made`,

    'entityCreate.connector.label': `${CommonMessages['connector.label']} Search`,
    'entityCreate.errors.missingDraftId': `Missing Draft ID.`,
};

const EntityEdit: ResolvedIntlConfig['messages'] = {
    'entityEdit.alert.detailsFormDisabled': `The details form cannot be edited at this time.`,
    'entityEdit.alert.endpointConfigDisabled': `We are working to enable editing of the endpoint configuration form. In the meantime, edits can be made in the Specification Editor below.`,
};

const MonacoEditor: ResolvedIntlConfig['messages'] = {
    'monacoEditor.serverDiff': `Your version is out of sync with the server.`,
    'monacoEditor.serverDiffCTA': `See changes`,
};

const CaptureCreate: ResolvedIntlConfig['messages'] = {
    'captureCreate.heading': `${RouteTitles['routeTitle.captureCreate']}`,
    'captureCreate.details.heading': `Capture Details`,
    'captureCreate.ctas.materialize': `Materialize Collections`,
    'captureCreate.instructions': `Provide a unique name and specify a source system for your capture. Fill in the required details and click "${CTAs['cta.generateCatalog.capture']}" to test the connection.`,
    'captureCreate.missingConnectors': `No connectors are installed. You must install a source connector to create a capture.`,
    'captureCreate.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']} to create a capture. Please contact an administrator.`,
    'captureCreate.tenant.label': `Prefix`,
    'captureCreate.config.source.doclink': `Connector Help`,
    'captureCreate.config.source.homepage': `Home`,
    'captureCreate.save.failed': `Capture creation failed. See below for details:`,
    'captureCreate.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.capture']}." `,
    'captureCreate.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.capture']}" again. You can also edit the specification file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureCreate.collections.heading': `Output Collections`,
    'captureCreate.collectionSelector.heading': `Collection Selector`,
    'captureCreate.collectionSelector.instructions': `The collections bound to your capture. To make changes, you can enter new values in the this section of the form or edit the YAML file shown in the ${EntityCreate['entityCreate.catalogEditor.heading']} section below.`,

    'captureCreate.test.failedErrorTitle': `Configuration Test Failed`,
    'captureCreate.test.serverUnreachable': `Unable to reach server while testing configuration.`,

    'captureCreate.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreate.save.failure.errorTitle': `Capture Save Failed`,
    'captureCreate.save.serverUnreachable': `Unable to reach server while saving capture`,
    'captureCreate.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureCreate.generate.failedErrorTitle': `Generating Specification Failed`,

    'captureCreate.createNotification.title': `New Capture Created`,
    'captureCreate.createNotification.desc': `Your new capture is published and ready to be used.`,

    'captureCreate.test.waitMessage': `Please wait while we test your capture.`,
    'captureCreate.testNotification.title': `Test Successful`,
    'captureCreate.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,
};

const CaptureEdit: ResolvedIntlConfig['messages'] = {
    'captureEdit.heading': `${RouteTitles['routeTitle.captureEdit']}`,
    'captureEdit.details.heading': `Capture Details`,
    'captureEdit.ctas.materialize': `Materialize Collections`,
    'captureEdit.instructions': `The name and destination of your existing capture.`,
    'captureEdit.missingConnectors': `No connectors are installed. You must install a source connector to edit a capture.`,
    'captureEdit.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']} to edit this capture. Please contact an administrator.`,
    'captureEdit.tenant.label': `Prefix`,
    'captureEdit.config.source.doclink': `Connector Help`,
    'captureEdit.config.source.homepage': `Home`,
    'captureEdit.save.failed': `Capture edit failed. See below for details:`,
    'captureEdit.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.capture']}." `,
    'captureEdit.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above or edit the YAML file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureEdit.collections.heading': `Output Collections`,
    'captureEdit.collectionSelector.heading': `Collection Selector`,
    'captureEdit.collectionSelector.instructions': `The collections bound to your existing capture. To make changes, you can enter new values in the this section of the form or edit the YAML file shown in the ${EntityCreate['entityCreate.catalogEditor.heading']} section below.`,

    'captureEdit.test.failedErrorTitle': `Configuration Test Failed`,
    'captureEdit.test.serverUnreachable': `Unable to reach server while testing configuration.`,

    'captureEdit.save.failedErrorTitle': `Capture Save Failed`,
    'captureEdit.save.failure.errorTitle': `Capture Save Failed`,
    'captureEdit.save.serverUnreachable': `Unable to reach server while saving capture`,
    'captureEdit.save.waitMessage': `Please wait while we test, save, and publish your capture.`,

    'captureEdit.generate.failedErrorTitle': `Generating Specification Failed`,

    'captureEdit.createNotification.title': `Edited Capture Saved`,
    'captureEdit.createNotification.desc': `Your edited capture is published and ready to be used.`,

    'captureEdit.test.waitMessage': `Please wait while we test your capture.`,
    'captureEdit.testNotification.title': `Test Successful`,
    'captureEdit.testNotification.desc': `Your capture succeeded in a dry run and can be saved.`,
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
    'detailsPanel.dataPreview.header': `Data Preview`,
    'detailsPanel.dataPreview.failedParsingMessage': `Ran into an problem parsing data. This is a UI bug and does not mean there is an issue with your data.`,
    'detailsPanel.specification.header': `Specification`,
    'detailsPanel.status.header': `Status`,
};

const MaterializationCreate: ResolvedIntlConfig['messages'] = {
    'materializationCreate.details.heading': `Materialization Details`,
    'materializationCreate.collections.heading': `Output Collections`,
    'materializationCreate.config.source.doclink': `Connector Help`,
    'materializationCreate.editor.default': `Before you can edit the materialization specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.materialization']}".`,
    'materializationCreate.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.materialization']}" again. You can also edit the specification file directly. Click "${CTAs['cta.saveEntity']}," to proceed.`,
    'materializationCreate.heading': `New Materialization`,
    'materializationCreate.instructions': `Provide a unique name and specify a destination system for your materialization. Fill in the required details and click "${CTAs['cta.generateCatalog.materialization']}".`,
    'materializationCreate.missingConnectors': `No connectors installed. A materialization connector must be installed before a materialization can be created.`,
    'materializationCreate.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']} to create a materialization. Please contact an administrator.`,
    'materializationCreate.save.failure': `Materialization creation failed. See below for details:`,
    'materializationCreate.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationCreate.save.serverUnreachable': `Unable to reach server while saving materialization`,
    'materializationCreate.tenant.label': `Prefix`,

    'materializationCreate.generate.failure.errorTitle': `Materialization Preparation Failed`,

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
    'materializationCreate.test.failedErrorTitle': `Materialization Test Failed`,

    'materializationCreate.testNotification.title': `Test Successful`,
    'materializationCreate.testNotification.desc': `Your materialization succeeded in a dry run and can be saved.`,
};

const MaterializationEdit: ResolvedIntlConfig['messages'] = {
    'materializationEdit.details.heading': `Materialization Details`,
    'materializationEdit.collections.heading': `Output Collections`,
    'materializationEdit.config.source.doclink': `Connector Help`,
    'materializationEdit.editor.default': `Before you can edit the materialization specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.materialization']}".`,
    'materializationEdit.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above or edit the YAML file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,
    'materializationEdit.heading': `Edit Materialization`,
    'materializationEdit.instructions': `The name and destination of your existing materialization.`,
    'materializationEdit.missingConnectors': `No connectors installed. A materialization connector must be installed before a materialization can be edited.`,
    'materializationEdit.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']} to edit a materialization. Please contact an administrator.`,
    'materializationEdit.save.failure': `Materialization edit failed. See below for details:`,
    'materializationEdit.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationEdit.save.serverUnreachable': `Unable to reach server while saving materialization`,
    'materializationEdit.tenant.label': `Prefix`,

    'materializationEdit.generate.failure.errorTitle': `Materialization Preparation Failed`,

    'materializationEdit.test.serverUnreachable': `Unable to reach server while testing configuration`,
    'materializationEdit.test.inProgress': `Please wait while we try to connect to the destination.`,

    'materializationEdit.collectionSelector.heading': `Collection Selector`,
    'materializationEdit.collectionSelector.instructions': `The collections bound to your existing materialization. To make changes, you can enter new values in the this section of the form or edit the YAML file shown in the ${EntityCreate['entityCreate.catalogEditor.heading']} section below.`,

    'materializationEdit.resourceConfig.heading': `Resource Configuration`,
    'materializationEdit.save.failedErrorTitle': `Materialization Save Failed`,
    'materializationEdit.save.waitMessage': `Please wait while we test, save, and publish your materialization.`,

    'materializationEdit.createNotification.title': `Edited Materialization Saved`,
    'materializationEdit.createNotification.desc': `Your edited materialization is published and ready to be used.`,

    'materializationEdit.test.waitMessage': `Please wait while we test your materialization.`,
    'materializationEdit.test.failedErrorTitle': `Materialization Test Failed`,

    'materializationEdit.testNotification.title': `Test Successful`,
    'materializationEdit.testNotification.desc': `Your materialization succeeded in a dry run and can be saved.`,
};

// TODO (optimization): Consolidate duplicate create and edit messages.
const Workflows: ResolvedIntlConfig['messages'] = {
    'workflows.error.endpointConfig.empty': `${endpointConfigHeader} empty`,
    'workflows.error.initForm': `An issue was encountered initializing the form.`,
    'workflows.error.initFormSection': `An issue was encountered initializing this section of the form.`,

    'workflows.collectionSelector.label.listHeader': `Collections`,
    'workflows.collectionSelector.label.discoveredCollections': `Discovered Collections`,
    'workflows.collectionSelector.label.existingCollections': `Existing Collections`,
    'workflows.collectionSelector.cta.delete': `Remove All`,
};

const ShardStatus: ResolvedIntlConfig['messages'] = {
    'shardStatus.primary': `PRIMARY`,
    'shardStatus.failed': `FAILED`,
    'shardStatus.idle': `PENDING`,
    'shardStatus.standby': `PENDING`,
    'shardStatus.backfill': `PENDING`,
    'shardStatus.disabled': `DISABLED`,
    'shardStatus.none': `No shard status found.`,
};

const OAuth: ResolvedIntlConfig['messages'] = {
    'oauth.instructions': `Authenticate your {provider} account by clicking below. A pop up will open where you can authorize access. No data will be accessed during authorization.`,
    'oauth.fetchAuthURL.error': `We failed to fetch the proper URL to start OAuth. ${Error['error.tryAgain']}`,
    'oauth.authentication.denied': `To use OAuth as your authentication you must allow our app access to your {provider} account.`,
    'oauth.accessToken.error': `There was an issue attempting to get the access token from {provider}. ${Error['error.tryAgain']}`,
    'oauth.emptyData.error': `We failed to get the data we need to populate the {provider} OAuth configuration. ${Error['error.tryAgain']}`,
    'oauth.authenticated': `Authenticated`,
    'oauth.unauthenticated': `Not Authenticated`,
    'oauth.authenticate': `Authenticate your {provider} account`,
    'oauth.remove': `Remove`,
};

const Supabase: ResolvedIntlConfig['messages'] = {
    'supabase.poller.failed': `We encountered a problem retrieving the status of this action. Please check your network connection and try again.`,
};

const Legal: ResolvedIntlConfig['messages'] = {
    'legal.heading': `Legal Stuff`,
    'legal.heading.outdated': `Updated Legal Stuff`,
    'legal.message': `Please use the links below to open and review the documents before you continue.`,
    'legal.message.outdated': `There have been changes to our legal documents you need to review. Please use the links below to view the documents before you continue.`,
    'legal.docs.terms': `Terms of Service`,
    'legal.docs.privacy': `Privacy Policy`,
    'legal.docs.accept': 'I accept the {privacy} and {terms}',
    'legal.docs.errorTitle': 'Please accept',
    'legal.docs.errorMessage':
        'Before you can continue using the application you must accept the listed documents.',
};

const Tenant: ResolvedIntlConfig['messages'] = {
    'tenant.heading': `Organization Name`,
    'tenant.message.1': `The organization name will be used as a prefix on everything you create within Estuary. This helps with scoping, controlling access, labeling ownership, and more.`,
    'tenant.message.2': `This begins as private but becomes public if you share anything or invite others to join your organization.`,

    'tenant.expectations': `You can use letters, numbers, periods, underscores, and hyphens`,
    'tenant.expectations.error': `Sorry, only letters(a-z), numbers(0-9), periods(.), underscores(_), and hyphens(-) allowed.`,

    'tenant.input.placeholder': `acmeCo`,
    'tenant.errorMessage.empty': `You must provide a name before continuing.`,

    'tenant.docs.message': `To see a detail explination please view our {link}`,
    'tenant.docs.message.link': `https://docs.estuary.dev/concepts/catalogs/#namespace`,
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
    ...EntityCreate,
    ...Captures,
    ...CaptureCreate,
    ...CaptureEdit,
    ...DetailsPanel,
    ...MaterializationCreate,
    ...MaterializationEdit,
    ...ShardStatus,
    ...OAuth,
    ...Welcome,
    ...EntityEdit,
    ...Supabase,
    ...Workflows,
    ...Legal,
    ...Tenant,
};

export default enUSMessages;
