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
    'common.testing': `Testing`,
    'common.invalid': `Invalid`,
    'common.fail': `Failed`,
    'common.skipped': `Skipped`,
    'common.publishing': `Publishing...`,
    'common.success': `Success`,
    'common.errors.heading': `Error`,
    'common.optionsAll': `All`,
    'common.optionsMissing': `No options`,
    'common.noData': `No data to display`,
    'common.loggedOut': `You have been logged out. Please log back in.`,
    'common.missing': `N/A`,
    'common.none': `none`,
    'common.noUnDo': `This action cannot be undone.`,
    'common.version': `version`,
    'common.tenant': `Prefix`,
    'common.tenant.creationForm': `Name`,
    'common.recommended': `Recommended`,
    'common.copied': `Copied`,
    'common.copyFailed': `Failed to copy`,
    'common.synchronizing': `Synchronizing`,
    'common.synchronized': `Synchronized`,
    'common.outOfSync': `Out of Sync`,
    'common.readOnly': `Read-Only`,
    'common.failedFetch': `Unable to reach server`,

    // Aria
    'aria.openExpand': `show more`,
    'aria.closeExpand': `show less`,

    // Terms
    'terms.connectors': `Connectors`,
    'terms.collections': `Collections`,
    'terms.bindings': `Bindings`,
    'terms.permissions': `Access Grants`,
    'terms.materialization': `Materialization`,
    'terms.capture': `Capture`,
    'terms.derivation': `Derivation`,
    'terms.documentation': `Docs`,
    'terms.storageMapping': `Storage Mappings`,

    // Common fields
    'entityPrefix.label': `Prefix`,
    'entityPrefix.description': `Prefix for the entity name.`,
    'entityName.label': `Name`,
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
    'alert.error': 'Error',
    'alert.warning': 'Warning',
    'alert.success': 'Success',
    'alert.info': 'Important',

    // Used in directives
    'directives.returning': `Welcome back. You still need to provide some information before using the application.`,

    // User in filters for tables
    'filter.time.today': `Today`,
    'filter.time.yesterday': `Yesterday`,
    'filter.time.lastWeek': `Last Week`,
    'filter.time.thisWeek': `This Week`,
    'filter.time.lastMonth': `Last Month`,
    'filter.time.thisMonth': `This Month`,

    'catalogName.limitations': `letters, numbers, periods, underscores, and hyphens`,
};

const CTAs: ResolvedIntlConfig['messages'] = {
    'cta.cancel': `Cancel`,
    'cta.close': `Close`,
    'cta.dismiss': `Dismiss`,
    'cta.continue': `Continue`,
    'cta.next': `Next`,
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
    'cta.login.azure': `Sign in with Azure`,
    'cta.register.azure': `Register with Azure`,
    'cta.configure': `Configure`,
    'cta.showAll': `Show All`,
    'cta.reload': `Reload`,
    'cta.evolve': `Apply`,
};

const Data: ResolvedIntlConfig['messages'] = {
    'data.name': `Name`,
    'data.fullName': `Full name`,
    'data.description': `Description`,
    'data.status': `Status`,
    'data.type': `Type`,
    'data.maintainer': `Maintainer`,
    'data.updated_at': `Updated`,
    'data.created_at': `Created`,
    'data.email': `Email`,
    'data.display_name': `Username`,
    'data.published_at': `Published At`,
    'data.pointer': `Pointer`,
    'data.exists': `Exists`,
    'data.field': `Field`,
    'data.writes_to': `Writes To`,
    'data.reads_from': `Reads From`,
    'data.data': `Data`,
    'data.docs': `Docs`,
    'data.connectorImage': `Connector Image`,
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
    'errorBoundry.chunkNotFetched.dialog.title': `Reload Required`,
    'errorBoundry.chunkNotFetched.error.title': `Failure to load`,
    'errorBoundry.chunkNotFetched.error.message1': `There was an issue fetching this portion of the application.`,
    'errorBoundry.chunkNotFetched.error.message2': `This is usually caused by a network issue or an old dashboard version being cached.`,
    'errorBoundry.chunkNotFetched.error.instructions': `To continue please reload.`,
};

const ConfirmationDialog: ResolvedIntlConfig['messages'] = {
    'confirm.title': `Are you sure?`,
    'confirm.loseData': `You have unsaved work. If you continue, you will lose your changes.`,
};

const FullPage: ResolvedIntlConfig['messages'] = {
    'fullPage.instructions': `Please try again. If the error persists, {docLink}`,
    'fullPage.instructions.docLink': `contact support`,
    'fullPage.instructions.docPath': `mailto:support@estuary.dev`,
};

const EntitiesHydrator: ResolvedIntlConfig['messages'] = {
    'entitiesHydrator.error.failedToFetch': `There was an issue while checking if you have any roles.`,
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
    'routeTitle.admin.billing': `Billing`,
    'routeTitle.admin.connectors': `Connectors`,
    'routeTitle.admin.settings': `Settings`,
    'routeTitle.captureCreate': `Create Capture`,
    'routeTitle.captureDetails': `Capture Details`,
    'routeTitle.captureEdit': `Edit Capture`,
    'routeTitle.captures': `Captures`,
    'routeTitle.collections': `Collections`,
    'routeTitle.collectionCreate': `Create Transformation`,
    'routeTitle.collectionDetails': `Collection Details`,
    'routeTitle.dataPlaneAuthReq': `Data-plane authorization check`,
    'routeTitle.directives': `Directives`,
    'routeTitle.details': `Details`,
    'routeTitle.error.entityNotFound': `Entity Not Found`,
    'routeTitle.error.pageNotFound': `Page Not Found`,
    'routeTitle.login': `Login`,
    'routeTitle.loginLoading': `Checking Credentials`,
    'routeTitle.noGrants': `Signed Up`,
    'routeTitle.legal': `Legal`,
    'routeTitle.materializationCreate': `Create Materialization`,
    'routeTitle.materializationDetails': `Materialization Details`,
    'routeTitle.materializationEdit': `Edit Materialization`,
    'routeTitle.materializations': `Materializations`,
    'routeTitle.registration': `Registration`,
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

    'home.hero.tab.ariaLabel': `Welcome Image Tabs`,
    'home.hero.tab.companyOverview': `What we do`,
    'home.hero.tab.companyDetails': `How it works`,
    'home.hero.tab.demo': `Live Demo`,

    'home.hero.companyOverview.cta': `How it works`,
    'home.hero.companyOverview.description': `{emphasis} helps you sync your data between the sources that produce it and destinations that consume it in real-time.`,
    'home.hero.companyOverview.description.emphasis':
        CommonMessages.productName,

    'home.hero.companyDetails.cta': `New capture`,
    'home.hero.companyDetails.step1': `Set up real-time data ingestion from your sources. Click “New Capture” to get started.`,
    'home.hero.companyDetails.step2': `Keep destination systems up to date with Materializations: low latency views of your data.`,

    'home.hero.demo.demoTenant.header': `Testing out Flow just got easier`,
    'home.hero.demo.demoTenant': `Estuary has a public {sharableTenant} tenant that can help you see Flow in action while you get set up. To give your tenant, {userTenant}, read access to it, {button}.`,
    'home.hero.demo.demoTenant.button': `click here`,

    'home.hero.1.title': `Wikipedia Data`,
    'home.hero.1.message': `Flow {emphasis} about 100 events per second from the Wikipedia’s API.`,
    'home.hero.1.message.emphasis': `captures`,
    'home.hero.1.button': `See the Capture`,

    'home.hero.2.title': `Transformation`,
    'home.hero.2.message': `We use a {emphasis} to aggregate the raw data.`,
    'home.hero.2.message.emphasis': CommonMessages['terms.derivation'],
    'home.hero.2.button': `See the Collection`,

    'home.hero.3.title': `Google Sheets`,
    'home.hero.3.message': `Flow {emphasis} a fact table with real-time updates.`,
    'home.hero.3.message.emphasis': `materializes`,
    'home.hero.3.button': `See the Materialization`,

    'home.hero.button': `See The Demo`,
};

const PageNotFound: ResolvedIntlConfig['messages'] = {
    'pageNotFound.heading': `Sorry, that page cannot be found.`,
    'pageNotFound.message': `Try searching for a page below or go directly to your {dashboard}.`,
};

const EntityNotFound: ResolvedIntlConfig['messages'] = {
    'entityNotFound.heading': `Sorry, that entity cannot be found.`,
    'entityNotFound.message': `The entity you are looking for could not be found. This is likely because it has been deleted.`,
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
    'login.register.message': `Please log in with a provider to use ${CommonMessages.productName} for free.`,

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
    'entityTable.data.specTypeWithColon': `Type:`,
    'entityTable.data.lastPublished': `Published`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.writesTo': Data['data.writes_to'],
    'entityTable.data.readsFrom': Data['data.reads_from'],
    'entityTable.data.status': `Status`,
    'entityTable.data.userFullName': `Name`,
    'entityTable.data.capability': `Capability`,
    'entityTable.data.objectRole': `Object`,
    'entityTable.data.lastPubUserFullName': `Last Updated By`,
    'entityTable.data.catalogPrefix': `Catalog Prefix`,
    'entityTable.data.provider': `Provider`,
    'entityTable.data.bucket': `Bucket`,
    'entityTable.data.prefix': `Prefix`,
    'entityTable.data.storagePrefix': `Prefix`,
    'entityTable.data.sharedPrefix': `Shared Prefix`,
    'entityTable.data.sharedWith': `Shared With`,

    'entityTable.stats.bytes_read': `Bytes Read`,
    'entityTable.stats.docs_read': `Docs Read`,
    'entityTable.stats.bytes_written': `Bytes Written`,
    'entityTable.stats.docs_written': `Docs Written`,

    'entityTable.stats.written': `Data Written`,
    'entityTable.stats.read': `Data Read`,
    'entityTable.stats.docs': `{docCount} {docCount, plural,
        one {doc}
        other {docs}
    }`,

    'entityTable.stats.error': `Failed to fetch stats.`,
    'entityTable.stats.filterMenu': `Stats for`,

    'entityTable.unmatchedFilter.header': `No results found.`,
    'entityTable.unmatchedFilter.message': `We couldn't find any data matching your search. Please try a different filter.`,

    'entityTable.technicalDifficulties.header': `There was an issue getting your data.`,
    'entityTable.technicalDifficulties.message': `We apologize for the inconvenience. You'll find a message describing the issue at the top of the page.`,
    'entityTable.moreEntities': `{count} more`,

    'entityTable.detailsLink': `View details`,

    'optionMenu.ariaLabel': `Open Option Menu`,
    'optionMenu.tooltip': `Options`,
    'optionMenu.option.detailsPanel.display': `View details`,
    'optionMenu.option.detailsPanel.hide': `Hide details`,
    'optionMenu.option.edit': `Edit specification`,
};

const LogsDialog: ResolvedIntlConfig['messages'] = {
    'logs.default': ` `,
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

    'admin.billing.header': `Billing`,
    'admin.billing.message.paidTier': `The {pricingTier} tier includes two tasks and {gbFree}GB every month. Thereafter you pay $0.75/GB with a \${taskRate} minimum per task.`,
    'admin.billing.error.paymentMethodsError': `There was an error connecting with our payment provider. Please try again later.`,
    'admin.billing.error.undefinedPricingTier': `An issue was encountered gathering information about the pricing tier associated with this tenant. Please {docLink}.`,
    'admin.billing.error.undefinedPricingTier.docLink': `contact support`,
    'admin.billing.error.undefinedPricingTier.docPath': `mailto:support@estuary.dev`,
    'admin.billing.label.tiers': `Pricing Tier`,
    'admin.billing.tier.free': `Open Source`,
    'admin.billing.tier.personal': `Cloud`,
    'admin.billing.tier.enterprise': `Enterprise`,
    'admin.billing.graph.dataByMonth.header': `Data Volume by Month`,
    'admin.billing.graph.tasksByMonth.header': `Tasks by Month`,
    'admin.billing.graph.dataByTask.header': `Data Volume by Task`,
    'admin.billing.graph.dataByTask.tooltip': `This graph displays the three, largest data processing tasks over the set interval.`,
    'admin.billing.table.history.header': `Recent History`,
    'admin.billing.table.history.label.dataVolume': `Data Volume`,
    'admin.billing.table.history.label.details': `Pricing Tier`,
    'admin.billing.table.history.label.month': `Month`,
    'admin.billing.table.history.label.tasks': `Tasks`,
    'admin.billing.table.history.label.totalCost': `Total Cost`,
    'admin.billing.table.history.tooltip.month': `This billing period began on {timestamp}`,
    'admin.billing.table.history.tooltip.dataVolume': `GB of data processed by tasks`,
    'admin.billing.table.history.emptyTableDefault.message': `We couldn't find any billing information on file. Only administrators of a tenant are able to review billing information.`,

    'admin.billing.paymentMethods.header': `Payment Information`,
    'admin.billing.paymentMethods.description': `Enter your payment information.  You won’t be charged until your account usage exceeds free tier limits.`,
    'admin.billing.paymentMethods.cta.addPaymentMethod': `Add Payment Method`,
    'admin.billing.paymentMethods.table.label.cardType': `Type`,
    'admin.billing.paymentMethods.table.label.name': `Name`,
    'admin.billing.paymentMethods.table.label.lastFour': `Last 4 Digits`,
    'admin.billing.paymentMethods.table.label.details': `Details`,
    'admin.billing.paymentMethods.table.label.primary': `Primary`,
    'admin.billing.paymentMethods.table.label.actions': `Actions`,
    'admin.billing.paymentMethods.table.emptyTableDefault.message': `No payment methods available.`,

    'admin.users.cta.prefixInvitation': `Manage Invitations`,
    'admin.users.prefixInvitation.header': `Manage Invitations`,
    'admin.users.prefixInvitation.message': `This is a placeholder for a description.`,
    'admin.users.prefixInvitation.label.capability': `Capability`,
    'admin.users.prefixInvitation.label.type': `Type`,
    'admin.users.prefixInvitation.cta.generateLink': `Generate Invitation`,

    'admin.prefix.cta.issueGrant': `Grant Access`,
    'admin.prefix.issueGrant.header': `Share Data`,
    'admin.prefix.issueGrant.message': `This is a placeholder for a description.`,
    'admin.prefix.issueGrant.label.capability': `Capability`,
    'admin.prefix.issueGrant.label.sharedPrefix': `Shared Prefix`,
    'admin.prefix.issueGrant.label.sharedWith': `Shared With`,
    'admin.prefix.issueGrant.cta.generateGrant': `Grant Access`,
    'admin.prefix.issueGrant.notification.success.title': `Grant Created Successfully`,
    'admin.prefix.issueGrant.notification.success.message': `{objectRole} has been shared with {subjectRole}.`,
    'admin.prefix.issueGrant.error.invalidPrefix': `The value entered in the Shared Prefix text field is not an extension of an existing prefix.`,

    'admin.cookies': `Cookie Preferences`,
    'admin.cookies.message': `Click below to configure your cookie preferences.`,
    'admin.tabs.users': `Account Access`,
    'admin.tabs.connectors': `Connectors`,
    'admin.tabs.api': `CLI-API`,
    'admin.tabs.billing': `Billing`,
    'admin.tabs.settings': `Settings`,
};

const Welcome: ResolvedIntlConfig['messages'] = {
    'welcome.image.alt': `A diagram showing the Flow logo at the center, connected by pipelines to multiple endpoint systems. Source systems on the left feed data into Flow and destination systems on the right receive data from Flow.`,
    'welcome.demo.alt': `A data pipeline diagram showing data moving into Flow from the Wikipedia HTTP source, and coming out of Flow into the Google Sheets destination.`,
};

const AccessGrants: ResolvedIntlConfig['messages'] = {
    'accessGrantsTable.header': `Captures`,
    'accessGrantsTable.users.title': `Organization Membership`,
    'accessGrantsTable.prefixes.title': `Data Sharing`,
    'accessGrantsTable.users.filterLabel': `Filter User or Object`,
    'accessGrantsTable.prefixes.filterLabel': `Filter Prefixes`,
    'accessGrants.message1': `No results found.`,
    'accessGrants.message2': `We couldn't find any results matching your search. Please try a different filter.`,

    'accessGrants.table.accessLinks.title': `Active Invitations`,
    'accessGrants.table.accessLinks.cta.generate': `Create Links`,
    'accessGrants.table.accessLinks.header.noData': `No active invitations found.`,
    'accessGrants.table.accessLinks.message.noData': `To create an invitation, click the "Generate Invitation" button above. Invitations will be listed here while they are live.`,
    'accessGrants.table.accessLinks.label.filter': `Filter Prefix or Capability`,
    'accessGrants.table.accessLinks.label.provisioningPrefix': `Provisioner`,
    'accessGrants.table.accessLinks.label.grantedPrefix': `Prefix`,
    'accessGrants.table.accessLinks.label.capability': `Capability`,
    'accessGrants.table.accessLinks.label.url': `URL`,
    'accessGrants.table.accessLinks.label.lastUpdated': `Last Updated`,
    'accessGrants.table.accessLinks.label.actions': `Actions`,
};

const StorageMappings: ResolvedIntlConfig['messages'] = {
    'storageMappings.header': `Cloud Storage`,
    'storageMappingsTable.title': `Storage Locations`,
    'storageMappingsTable.filterLabel': `Filter by Prefix`,
    'storageMappingsTable.message1': `No results found.`,
    'storageMappingsTable.message2': `We couldn't find any results matching your search. Please try a different filter.`,
    'storageMappings.prefix.description': `The Flow prefix you want to configure`,
    'storageMappings.provider.label': `Provider`,
    'storageMappings.provider.description': `The provider (ex: S3, GCP) you are using`,
    'storageMappings.bucket.label': `Bucket`,
    'storageMappings.bucket.description': `The name of the bucket you have setup to store data in.`,
    'storageMappings.lastUpdated.label': `Last Updated`,
    'storageMappings.message': `Below are all the ${CommonMessages['terms.storageMapping']} that you have read or admin access to. These are the locations that your data is stored. You currently cannot edit these in the UI. If you need an update please contact support.`,
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
    'collectionsTable.cta.new': `New Transformation`,
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
    'entityCreate.catalogEditor.heading': `Advanced Specification Editor`,
    'entityCreate.docs.header': `Connector Help`,
    'entityCreate.cta.docs': `Connector Help`,
    'entityCreate.errors.collapseTitle': `View logs`,
    'entityCreate.errors.collapseTitleOpen': `Hide logs`,
    'entityCreate.sops.failedTitle': `Configuration Encryption Failed`,
    'entityCreate.endpointConfig.heading': `${endpointConfigHeader}`,
    'entityCreate.endpointConfig.errorSummary': `There are issues with the form.`,
    'entityCreate.instructions': `To start select a Connector below. Once you make a selection the rest of the form will display and you can configure your endpoint. You can search by name and if you do not find what you are looking for please let us know by requesting the connector.`,

    'entityCreate.endpointConfig.detailsHaveErrors': `The Details section has errors:`,
    'entityCreate.endpointConfig.resourceConfigHaveErrors': `The Collections section has errors:`,
    'entityCreate.endpointConfig.endpointConfigHaveErrors': `The ${endpointConfigHeader} section has errors:`,

    'entityCreate.endpointConfig.noConnectorSelectedTitle': `Please select a Connector to begin`,
    'entityCreate.endpointConfig.noConnectorSelected': `To start the creation process you must select a Connector. You can change this later.`,

    'entityCreate.endpointConfig.entityNameMissing': `Name missing`,
    'entityCreate.endpointConfig.entityNameInvalid': `Name invalid`,
    'entityCreate.endpointConfig.connectorMissing': `Connector missing`,
    'entityCreate.endpointConfig.endpointConfigMissing': `${endpointConfigHeader} empty`,
    'entityCreate.endpointConfig.collectionsMissing': `${CommonMessages['terms.collections']} missing`,
    'entityCreate.endpointConfig.resourceConfigInvalid': `Resource Config invalid`,

    'entityCreate.endpointConfig.configCanBeBlank.message': `This {entityType} requires no configuration.`,

    'entityCreate.bindingsConfig.collectionsLabel': `Search {items}`,
    'entityCreate.bindingsConfig.noRows': `Please select from the list above to begin.`,
    'entityCreate.bindingsConfig.noRowsTitle': `No selection made`,

    'entityCreate.connector.label': `${CommonMessages['connector.label']} Search`,
    'entityCreate.errors.missingDraftId': `Missing Draft ID.`,

    'discovery.failed.title': `Generating Specification Failed`,
    'discovery.failed.message': `There was an issue attempting to discover your endpoint. Please review details below.`,
};

const EntityEdit: ResolvedIntlConfig['messages'] = {
    'entityEdit.alert.detailsFormDisabled': `The details form cannot be edited at this time.`,
    'entityEdit.alert.endpointConfigDisabled': `Editing of the endpoint configuration form disabled.`,
};

const MonacoEditor: ResolvedIntlConfig['messages'] = {
    'monacoEditor.serverDiff': `Your version is out of sync with the server.`,
    'monacoEditor.serverDiffCTA': `See changes`,

    'monacoEditor.alert.invalid': `An error was encountered parsing the contents of the editor. Invalid syntax is the most common source of this error.`,
};

const CaptureCreate: ResolvedIntlConfig['messages'] = {
    'captureCreate.heading': `${RouteTitles['routeTitle.captureCreate']}`,
    'captureCreate.details.heading': `Capture Details`,
    'captureCreate.ctas.materialize': `Materialize Collections`,
    'captureCreate.instructions': `Provide a unique name and specify a source system for your capture. Fill in the required details and click "${CTAs['cta.generateCatalog.capture']}" to test the connection.`,
    'captureCreate.missingConnectors': `No connectors are installed. You must install a source connector to create a capture.`,
    'captureCreate.tenant.label': `Prefix`,
    'captureCreate.config.source.doclink': `Connector Help`,
    'captureCreate.config.source.homepage': `Home`,
    'captureCreate.save.failed': `Capture creation failed. See below for details:`,
    'captureCreate.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.capture']}." `,
    'captureCreate.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.capture']}" again. You can also edit the specification file directly below. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureCreate.collections.heading': `Output Collections`,
    'captureCreate.collectionSelector.heading': `Collection Selector`,
    'captureCreate.collectionSelector.instructions': `The collections bound to your capture. To update the configuration, please update the fields under the Config tab. To update the schema, click Edit under the Collection tab.`,

    'captureCreate.test.failedErrorTitle': `Configuration Test Failed`,
    'captureCreate.test.serverUnreachable': `${CommonMessages['common.failedFetch']} while testing configuration.`,

    'captureCreate.save.failedErrorTitle': `Capture Save Failed`,
    'captureCreate.save.failure.errorTitle': `Capture Save Failed`,
    'captureCreate.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving capture`,
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
    'captureEdit.tenant.label': `Prefix`,
    'captureEdit.config.source.doclink': `Connector Help`,
    'captureEdit.config.source.homepage': `Home`,
    'captureEdit.save.failed': `Capture edit failed. See below for details:`,
    'captureEdit.editor.default': `Before you can edit the capture specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.capture']}." `,
    'captureEdit.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above or edit the YAML file directly. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'captureEdit.collections.heading': `Output Collections`,
    'captureEdit.collectionSelector.heading': `Collection Selector`,
    'captureEdit.collectionSelector.instructions': `The collections bound to your existing capture. To update the configuration, please update the fields under the Config tab. To update the schema, click Edit under the Collection tab.`,

    'captureEdit.test.failedErrorTitle': `Configuration Test Failed`,
    'captureEdit.test.serverUnreachable': `${CommonMessages['common.failedFetch']} while testing configuration.`,

    'captureEdit.save.failedErrorTitle': `Capture Save Failed`,
    'captureEdit.save.failure.errorTitle': `Capture Save Failed`,
    'captureEdit.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving capture`,
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
    'detailsPanel.shardDetails.fetchError': `Unable to fetch shard status`,
    'detailsPanel.shardDetails.docLink': `Docs`,
    'detailsPanel.shardDetails.title': `Shard Information`,
    'detailsPanel.shardDetails.status.label': `Status`,
    'detailsPanel.shardDetails.id.label': `ID`,
    'detailsPanel.shardDetails.errorTitle': `Shard Replica Processing Errors`,
    'detailsPanel.shardDetails.noStatusFound': `No shard status to report`,
    'detailsPanel.shardDetails.docPath': `https://docs.estuary.dev/concepts/advanced/shards/`,
    'detailsPanel.dataPreview.header': `Data Preview`,
    'detailsPanel.dataPreview.failedParsingMessage': `Ran into an problem parsing data. This is a UI bug and does not mean there is an issue with your data.`,
    'detailsPanel.specification.header': `Specification`,
    'detailsPanel.status.header': `Status`,
    'detailsPanel.details.title': `Details`,
    'detailsPanel.totals.title': `Usage this month`,
    'detailsPanel.recentUsage.title.prefix': `Usage over the past`,
    'detailsPanel.recentUsage.range.label': `Timeframe`,
    'detailsPanel.recentUsage.filter.label': `{range} hours`,
    'detailsPanel.recentUsage.createdAt.label': `Creation hour`,
    'detailsPanel.details.linkToCollection': `View details for {catalogName}`,
};

const MaterializationCreate: ResolvedIntlConfig['messages'] = {
    'materializationCreate.details.heading': `Materialization Details`,
    'materializationCreate.collections.heading': `Source Collections`,
    'materializationCreate.config.source.doclink': `Connector Help`,
    'materializationCreate.editor.default': `Before you can edit the materialization specification, you must fill out the Connection Configuration section and click "${CTAs['cta.generateCatalog.materialization']}".`,
    'materializationCreate.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.generateCatalog.materialization']}" again. You can also edit the specification file directly. Click "${CTAs['cta.saveEntity']}," to proceed.`,
    'materializationCreate.heading': `New Materialization`,
    'materializationCreate.instructions': `Provide a unique name and specify a destination system for your materialization. Fill in the required details and click "${CTAs['cta.generateCatalog.materialization']}".`,
    'materializationCreate.missingConnectors': `No connectors installed. A materialization connector must be installed before a materialization can be created.`,
    'materializationCreate.save.failure': `Materialization creation failed. See below for details:`,
    'materializationCreate.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationCreate.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving materialization`,
    'materializationCreate.tenant.label': `Prefix`,

    'materializationCreate.generate.failure.errorTitle': `Materialization Preparation Failed`,

    'materializationCreate.test.serverUnreachable': `${CommonMessages['common.failedFetch']} while testing configuration`,
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
    'materializationEdit.save.failure': `Materialization edit failed. See below for details:`,
    'materializationEdit.save.failure.errorTitle': `Materialization Save Failed`,
    'materializationEdit.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving materialization`,
    'materializationEdit.tenant.label': `Prefix`,

    'materializationEdit.generate.failure.errorTitle': `Materialization Preparation Failed`,

    'materializationEdit.test.serverUnreachable': `${CommonMessages['common.failedFetch']} while testing configuration`,
    'materializationEdit.test.inProgress': `Please wait while we try to connect to the destination.`,

    'materializationEdit.collectionSelector.heading': `Collection Selector`,
    'materializationEdit.collectionSelector.instructions': `The collections bound to your existing materialization. To update the configuration, please update the fields under the Config tab. To update the schema, click Edit under the Collection tab.`,

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

const ExistingEntityCheck: ResolvedIntlConfig['messages'] = {
    'existingEntityCheck.heading': `One more thing...`,
    'existingEntityCheck.instructions': `We found at least one {connectorName} {entityType} in the system.`,

    'existingEntityCheck.instructions2': `Adding to an existing {entityType} can help save time and cut cost. Choose a {entityType} from the list to edit it. If you'd still prefer to start from scratch, select the New {connectorName} {entityType} option below.`,

    'existingEntityCheck.toolbar.label.filter': `Search existing tasks`,
    'existingEntityCheck.toolbar.label.sortDirection': `Sort Direction`,

    'existingEntityCheck.existingCard.label.lastPublished': `Last published on {date}`,
    'existingEntityCheck.filter.unmatched.header': `No results found.`,
    'existingEntityCheck.filter.unmatched.message': `We couldn't find any data matching your search. Please try a different filter.`,

    'existingEntityCheck.newCard.label': `New {connectorName} {entityType}`,
};

// TODO (optimization): Consolidate duplicate create and edit messages.
const Workflows: ResolvedIntlConfig['messages'] = {
    'workflows.error.endpointConfig.empty': `${endpointConfigHeader} empty`,
    'workflows.error.initForm': `An issue was encountered initializing the form.`,
    'workflows.error.initFormSection': `An issue was encountered initializing this section of the form.`,

    'workflows.initTask.alert.title.initFailed': `Form Initialization Error`,
    'workflows.initTask.alert.message.initFailed': `An issue was encountered initializing the form. Try refreshing the page and if the issue persists {docLink}.`,
    'workflows.initTask.alert.message.initFailed.docLink': `contact support`,
    'workflows.initTask.alert.message.initFailed.docPath': `mailto:support@estuary.dev`,
    'workflows.initTask.alert.message.patchedSpec': `An issue was encountered recovering your changes. The latest, published record of the task was used to initialize the form.`,

    'workflows.collectionSelector.cta.delete': `Remove All`,
    'workflows.collectionSelector.cta.rediscover': `Refresh`,
    'workflows.collectionSelector.cta.schemaEdit': `CLI`,
    'workflows.collectionSelector.cta.schemaInference': `Schema Inference`,
    'workflows.collectionSelector.error.title.editorInitialization': `Editor initialization failed`,
    'workflows.collectionSelector.error.title.missingCollectionSchema': `Failed to fetch collection specification`,
    'workflows.collectionSelector.error.message.invalidPubId': `This specification may have diverged from the latest, published record of the collection. Your unpublished changes can be found in the editor.`,
    'workflows.collectionSelector.error.message.draftCreationFailed': `The latest, published record of the collection can be found in the editor. It is read-only.`,
    'workflows.collectionSelector.header.collectionSchema': `Collection Schema`,
    'workflows.collectionSelector.label.discoveredCollections': `Discovered Collections`,
    'workflows.collectionSelector.label.existingCollections': `Existing Collections`,
    'workflows.collectionSelector.label.listHeader': `Collections`,
    'workflows.collectionSelector.tab.collectionSchema': `Collection`,
    'workflows.collectionSelector.tab.resourceConfig': `Config`,
    'workflows.collectionSelector.tab.fieldSelection': `Field Selection`,

    'workflows.collectionSelector.schemaEdit.cta.syncSchema': `Synchronize Schema`,
    'workflows.collectionSelector.schemaEdit.header': `CLI`,
    'workflows.collectionSelector.schemaEdit.flowctlDocLink': `https://docs.estuary.dev/concepts/flowctl/`,
    'workflows.collectionSelector.schemaEdit.description': `Use the commands below to edit the schema for this collection. Once executed, click the Synchronize Schema button below to pull the changes on the server into the UI.`,
    'workflows.collectionSelector.schemaEdit.message1': `Pull down the draft to edit`,
    'workflows.collectionSelector.schemaEdit.message2': `Push your changes up to the server`,
    'workflows.collectionSelector.schemaEdit.discoveredCollection.command1': `flowctl draft select --id {draftId} && flowctl draft develop`,
    'workflows.collectionSelector.schemaEdit.discoveredCollection.command2': `flowctl draft author --source <flow_catalog_file_location>`,
    'workflows.collectionSelector.schemaEdit.existingCollection.command1': `flowctl draft select --id {draftId}`,
    'workflows.collectionSelector.schemaEdit.existingCollection.command2': `flowctl catalog draft --name {catalogName} && flowctl draft develop`,
    'workflows.collectionSelector.schemaEdit.existingCollection.command3': `flowctl draft author --source <flow_catalog_file_location>`,
    'workflows.collectionSelector.schemaEdit.alert.message.schemaUpdateError': `An error was encountered fetching your updated collection schema to display. This does not mean that there was a problem updating the server. Open the CLI popper and click the Synchronize Schema button to try again.`,

    'workflows.collectionSelector.schemaInference.header': `Schema Inference`,
    'workflows.collectionSelector.schemaInference.message': `Flow can help you tighten your collection specification. It will review the documents in a collection and approximate the shape of your data.`,
    'workflows.collectionSelector.schemaInference.message.schemaDiff': `The difference between the current collection specification and the specification containing the inferred schema is highlighted below.`,
    'workflows.collectionSelector.schemaInference.message.documentsRead': `A total of {documents_read} documents were evaluated to generate the inferred schema.`,
    'workflows.collectionSelector.schemaInference.alert.noDocuments.header': `No Documents Found`,
    'workflows.collectionSelector.schemaInference.alert.noDocuments.message': `We were unable to find any documents in this collection. Consequently, could not infer the shape of its data.`,
    'workflows.collectionSelector.schemaInference.alert.lowDocumentCount.header': `Low Document Count`,
    'workflows.collectionSelector.schemaInference.alert.lowDocumentCount.message': `Fewer documents than desired were found. This could mean that your collection isn't seeing very much data.`,
    'workflows.collectionSelector.schemaInference.alert.generalError.header': `Server Error`,
    'workflows.collectionSelector.schemaInference.alert.inferenceService.message': `This is not something you did wrong. An error was encountered while inferring the shape of the documents in this collection.`,
    'workflows.collectionSelector.schemaInference.alert.patchService.message': `This is not something you did wrong. An error was encountered while applying the inferred schema. Please try again. If the error persists, {docLink}`,
    'workflows.collectionSelector.schemaInference.alert.patchService.message.docLink': `contact support`,
    'workflows.collectionSelector.schemaInference.alert.patchService.message.docPath': `mailto:support@estuary.dev`,
    'workflows.collectionSelector.schemaInference.cta.continue': `Apply Inferred Schema`,
};

const ShardStatus: ResolvedIntlConfig['messages'] = {
    'shardStatus.primary': `PRIMARY`,
    'shardStatus.failed': `FAILED`,
    'shardStatus.idle': `PENDING`,
    'shardStatus.standby': `PENDING`,
    'shardStatus.backfill': `PENDING`,
    'shardStatus.disabled': `DISABLED`,
    'shardStatus.basicCollection': `Collection`,
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
    'oauth.edit.message': `If you edit your endpoint config and want to continue using OAuth you must reauthenticate.`,
};

const Supabase: ResolvedIntlConfig['messages'] = {
    'supabase.poller.failed.title': `${CommonMessages['common.failedFetch']}`,
    'supabase.poller.failed.message': `We encountered a problem retrieving the status of this action. Please check your network connection and try again.`,
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
    'legal.error.failedToFetch.message': `There was an issue while checking if you have accepted the latest {privacy} and {terms}.`,
};

const Tenant: ResolvedIntlConfig['messages'] = {
    'tenant.heading': `Let's get started`,
    'tenant.message.1': `The organization name will be used as a prefix for everything you create within Estuary.  It will only be public if you share data with other organizations.`,

    'tenant.expectations': `You can use ${CommonMessages['catalogName.limitations']}`,
    'tenant.expectations.error': `Sorry, only letters(a-z), numbers(0-9), periods(.), underscores(_), and hyphens(-) allowed.`,

    'tenant.input.label': `Organization Name`,
    'tenant.input.placeholder': `acmeCo`,
    'tenant.errorMessage.empty': `You must provide a name before continuing.`,

    'tenant.docs.message': `To see a detailed explanation please view our {link}`,
    'tenant.docs.message.link': `https://docs.estuary.dev/concepts/catalogs/#namespace`,

    'tenant.origin.radioGroup.label': `How'd you hear about us?`,
    'tenant.origin.radio.browserSearch.label': `Search (Google, Bing, etc.)`,
    'tenant.origin.radio.linkedIn.label': `LinkedIn`,
    'tenant.origin.radio.referral.label': `Referral by a Partner`,
    'tenant.origin.radio.youTube.label': `YouTube`,
    'tenant.origin.radio.email.label': `Email`,
    'tenant.origin.radio.gitHub.label': `GitHub`,
    'tenant.origin.radio.paidAdvertising.label': `Paid Advertising`,
    'tenant.origin.radio.other.label': `Other`,

    'tenant.grantDirective.header': `Tenant shared with you`,
    'tenant.grantDirective.message': `You have been provisioned {grantedCapability} access to the following tenant:`,

    'tenant.grantDirective.error.header': `Unable to Provision Access`,
    'tenant.grantDirective.error.message': `A problem was encountered provisioning access to the requested tenant. The access link could have been single-use or revoked by an administrator of the tenant.`,
    'tenant.grantDirective.error.message.help': `For additional context, please {docLink}.`,
    'tenant.grantDirective.error.message.help.docLink': `contact support`,
    'tenant.grantDirective.error.message.help.docPath': `mailto:support@estuary.dev`,

    'tenant.error.failedToFetch.message': `There was an issue while checking if you have access to a tenant.`,
};

const Details: ResolvedIntlConfig['messages'] = {
    'details.tabs.overview': `Overview`,
    'details.tabs.spec': `Spec`,
    'details.tabs.shardStatus': `Status`,
    'details.tabs.history': `History`,
};

const Docs: ResolvedIntlConfig['messages'] = {
    'docs.iframe.title': `{connector} Documentation`,
    'docs.iframe.disabled.title': `Connector documentation disabled`,
    'docs.iframe.disabled.message': `We cannot open 3rd party documentation inline. To view you must open {docLink} in a new window.`,
    'docs.iframe.disabled.message.docLink': `connector help`,
    'docs.cta.expand': `Help`,
    'docs.cta.expand.tooltip': `Expand Connector Help`,
    'docs.cta.expand.disabled': `Open 3rd party docs in new window`,
};

const NewTransform: ResolvedIntlConfig['messages'] = {
    'newTransform.modal.title': `Derive A New Collection`,
    'newTransform.language.title': `Language`,
    'newTransform.language.sql': `SQL`,
    'newTransform.language.ts': `Typescript`,
    'newTransform.baseConfig.sourceCollections.label': `Source Collections`,
    'newTransform.baseConfig.sqlTemplates.label': `SQL Templates`,
    'newTransform.collection.label': `Derived Collection Name`,
    'newTransform.errors.collection': `Select source collections`,
    'newTransform.errors.name': `Name your Derived Collection`,
    'newTransform.errors.prefixMissing': `No prefix selected`,
    'newTransform.errors.namePattern': `Name does not match pattern`,
    'newTransform.errors.nameInvalid': `Invalid entity name`,
    'newTransform.errors.nameMissing': `Missing entity name`,
    'newTransform.errors.urlNotGenerated': `We failed to generate the proper URL to start GitPod. ${Error['error.tryAgain']}`,
    'newTransform.errors.gitPodWindow': `Failed to open GitPod. Your browser may be blocking it from opening. Please ensure your browser allows pop-ups.`,
    'newTransform.errors.draftSpecCreateFailed': `Creating Specification Failed`,
    'newTransform.errors.draftSpecUpdateFailed': `Updating Specification Failed`,
    'newTransform.info.gitPodWindowTitle': `GitPod should be opened in a new tab or window`,
    'newTransform.info.gitPodWindowMessage': `To develop your transformation please use GitPod.`,
    'newTransform.stepper.step1.label': `Select source collections`,
    'newTransform.stepper.step2.label': `Transformation Language`,
    'newTransform.stepper.step3.label': `Write transformations`,
    'newTransform.instructions1': `You will be set up with an environment to create a
                            transformation.`,
    'newTransform.instructions2': `Create your query and use the CLI to
                            continue, e.g`,
    'newTransform.button.cta': `Proceed to GitPod`,

    'newTransform.config.header': `Database`,
    'newTransform.config.description': `This is a placeholder for a section description`,
    'newTransform.config.tab.advancedSettings': `Advanced`,
    'newTransform.config.tab.basicSettings': `General`,
    'newTransform.config.advancedSettings.header': `Advanced Internal State Settings`,
    'newTransform.config.transform.header': `Transforms`,
    'newTransform.config.transform.addDialog.header': `Add Transform`,
    'newTransform.config.migration.header': `Migrations`,
    'newTransform.config.message.listEmpty': `Click on the plus sign above to add a {contentType}.`,
    'newTransform.config.alert.noTransformSelected': `No transform selected.`,

    'newTransform.schema.header': `Schema`,
    'newTransform.schema.description': `Edit the templated derivation schema below.`,
    'newTransform.schema.cta.generatePreview': `Preview`,
    'newTransform.schema.dataPreview.header': `Data Preview`,

    'newTransform.finalReview.instructions': `The following Flow specification was generated from the details you provided. To make changes, you can enter new values in the form above and click "${CTAs['cta.next']}" again. You can also edit the specification file directly below. Click "${CTAs['cta.saveEntity']}" to proceed.`,

    'newTransform.editor.streaming.header': `Streaming`,
    'newTransform.editor.streaming.description': `Used for selecting columns and creating aggregations`,
    'newTransform.editor.streaming.cta.generatePreview': `Preview`,
    'newTransform.editor.streaming.advancedSettings': `Advanced Streaming Settings`,
    'newTransform.editor.streaming.shuffleKeys.header': `Shuffle Keys`,
    'newTransform.editor.streaming.shuffleKeys.tooltip': `Select a key from your source collection schemas to help scale joins`,

    'newTransform.editor.preview.header': `Data Preview`,
    'newTransform.editor.preview.description': `This is a placeholder for a section description`,
    'newTransform.editor.preview.noPreviewGenerated': `Click PREVIEW to sample your derivation.`,

    'newTransform.save.failedErrorTitle': `Derivation Save Failed`,
    'newTransform.save.failure.errorTitle': `Derivation Save Failed`,
    'newTransform.save.serverUnreachable': `${CommonMessages['common.failedFetch']} while saving derivation`,
    'newTransform.save.waitMessage': `Please wait while we test, save, and publish your derivation.`,

    'newTransform.createNotification.title': `New Derivation Created`,
    'newTransform.createNotification.desc': `Your new derivation is published and ready to be used.`,
};

const CustomRenderers: ResolvedIntlConfig['messages'] = {
    'oauth.error.credentialsMissing': `need to complete OAuth`,
    'dateTimePicker.button.ariaLabel': `Open date time picker for {label}`,
    'datePicker.button.ariaLabel': `Open date picker for {label}`,
    'timePicker.button.ariaLabel': `Open time picker for {label}`,
};

const TaskEndpoints: ResolvedIntlConfig['messages'] = {
    'taskEndpoint.list.title': `Endpoints`,
    'taskEndpoint.otherProtocol.message': `{protocol} hostname: {hostname}`,
    'taskEndpoint.multipleEndpoints.message': `mutliple endpoints exposed, see task details for their addresses.`,

    'taskEndpoint.link.public.label': 'Public endpoint: ',
    'taskEndpoint.link.private.label': 'Private endpoint: ',
    'taskEndpoint.visibility.public.tooltip':
        'Public: anyone may access this port over the public internet',
    'taskEndpoint.visibility.private.tooltip':
        'Private: access to this port is restricted to authenticated users who have "admin" permissions to the task',
};

const DataPlaneAuthReq: ResolvedIntlConfig['messages'] = {
    'dataPlaneAuthReq.error.message': `Authorization to access {catalogPrefix} failed: {error}`,
    'dataPlaneAuthReq.waiting.message': `Please wait while we authorize access to {catalogPrefix}. You will be redirected shortly.`,
};

const SchemaEditor_Collection: ResolvedIntlConfig['messages'] = {
    'schemaEditor.fields.label': `Schema`,
    'schemaEditor.key.label': `Key`,
    'schemaEditor.key.helper': `Ordered JSON Pointers that define how a composite key may be extracted from a collection document.`,
    'schemaEditor.table.empty.header': `No fields to display.`,
    'schemaEditor.table.empty.message': `We were unable to generate a table from the current schema. Please update the schema.`,
    'schemaEditor.error.title': `Schema Invalid`,
    'keyAutoComplete.keys.group.must': `Fields that always exist`,
    'keyAutoComplete.keys.group.may': `Fields that sometimes exist`,
    'keyAutoComplete.keys.invalid.message': `Field is not a valid key. Please remove or update the schema.`,
    'keyAutoComplete.keys.invalid.message.readOnly': `Field is not a valid key. Please update the schema.`,
    'keyAutoComplete.keys.missing.title': `Key is empty`,
    'keyAutoComplete.keys.missing.message': `All collections require a key. Please provide a key to continue.`,
    'keyAutoComplete.noOptions.message': `Without a valid schema we cannot provide options for the key. Please fix schema.`,
    'keyAutoComplete.noUsableKeys.message': `No fields in the schema are valid keys. Please update schema.`,
};

const EntityEvolution: ResolvedIntlConfig['messages'] = {
    'entityEvolution.failure.errorTitle': `Update Failed`,
    'entityEvolution.serverUnreachable': `${CommonMessages['common.failedFetch']} while trying to update collections`,
    'entityEvolution.error.title': `Changes rejected due to incompatible collection updates`,
    'entityEvolution.error.message': `The proposed collection changes would break downstream tasks. You can click '${CTAs['cta.evolve']}' below to automatically update your draft with the following recommended actions.`,
    'entityEvolution.error.note': `Note: This may result in additional cost as new versions are backfilled.`,

    // Single quotes are special and must be doubled: https://formatjs.io/docs/core-concepts/icu-syntax#quoting--escaping
    'entityEvolution.action.recreateOneBinding.description': `the Materialization ''{materializationName}'' will be updated to materialize the collection into a new resource`,
    'entityEvolution.action.recreateBindings.description': `{materializationCount} {materializationCount, plural,
        one {Materialization}
        other {Materializations}
    } will be updated to materialize the collection into new resources`,
    'entityEvolution.action.recreateBindings.help': `Any materializations of this collection will be updated to materialize it
    into a new resource (database table, for example) with an incremented version suffix (like "_v2"). The Collection itself will
    have the schema updated in place, and will retain all current data. The materialization will backfill from the beginning of
    this collection, but other bindings in the materialization will not be affected.`,

    'entityEvolution.action.recreateCollection.description': `Collection will be re-created as ''{newName}'' because {reason}`,
    'entityEvolution.action.recreateCollection.help': `This will create a new Collection with the name shown.
    The Capture will be updated to write into the new collection, and will backfill the collection from source system.
    Any Materializations will also be updated to materialize the new collection instead of the old one.
    The result will be a new resource (database table, for example) with an incremented version suffix (like "_v2")`,

    'entityEvolution.action.recreateCollection.reason.keyChange':
        'the collection key cannot be modified',
    'entityEvolution.action.recreateCollection.reason.partitionChange':
        'the collection partitions cannot be modified',
    'entityEvolution.action.recreateCollection.reason.prevDeletedSpec':
        'a live spec with this same name has already been created and was subsequently deleted',
    'entityEvolution.action.recreateCollection.reason.authoritativeSourceSchema':
        'a live spec with this same name has already been created and was subsequently deleted',
};

const DraftErrors: ResolvedIntlConfig['messages'] = {
    'draftErrors.totalCount': `Displaying {displaying} of {total, plural, one {# error} other {# errors}} `,
};

const UpdateEntity: ResolvedIntlConfig['messages'] = {
    'updateEntity.noLiveSpecs': `Unable to find entity on server.`,
    'updateEntity.collection.skipped': `${CTAs['cta.enable']} and ${CTAs['cta.disable']} only work on derivations`,
};

const PrefixedName: ResolvedIntlConfig['messages'] = {
    'prefixedName.description': `Select a prefix from the drop-down and add a unique name. (ex: acmeCo/marketing_data)`,
    'prefixedName.description.singlePrefix': `Prefix already selected. Please add a unique name. (ex: marketing_data)`,
};

const CustomErrors: ResolvedIntlConfig['messages'] = {
    'custom.prefixedName.noAccessGrants': `You do not have the necessary ${CommonMessages['terms.permissions']}. Please contact an administrator.`,
    'custom.prefixedName.prefix.missing': `please select an organization`,
    'custom.prefixedName.name.missing': `please provide a name`,
    'custom.prefixedName.name.unclean': `cannot contain ./ or ../`,
    'custom.prefixedName.name.endingSlash': `cannot end with /`,
    'custom.prefixedName.name.invalid': `may only include ${CommonMessages['catalogName.limitations']} separated by forward slashes`,
    'custom.prefixedName.invalid': `You do not have the necessary ${CommonMessages['terms.permissions']}. Please contact an administrator.`,
    'custom.catalogName.pattern': `must match pattern "organization/name"\nwhich may include ${CommonMessages['catalogName.limitations']}`,
};

const Graphs: ResolvedIntlConfig['messages'] = {
    'graphs.empty.header': `No information found.`,
    'graphs.entityDetails.empty.message': `Unable to fetch details for data usage graph.`,
};

const FieldSelection: ResolvedIntlConfig['messages'] = {
    'fieldSelection.table.cta.addProjection': `Add Projection`,
    'fieldSelection.table.cta.renameField': `Rename`,
    'fieldSelection.table.empty.header': `No information found`,
    'fieldSelection.table.empty.message': `Click the test button above to validate your resource configuration and create a set of projections.`,
    'fieldSelection.table.label.details': `Details`,
    'fieldSelection.table.label.actions': `Actions`,
    'fieldSelection.table.label.fieldRequired': `Field Required`,
    'fieldSelection.table.label.locationRequired': `Location Required`,
    'fieldSelection.table.label.locationRecommended': `Location Recommended`,
    'fieldSelection.table.label.fieldOptional': `Field Optional`,
    'fieldSelection.table.label.fieldForbidden': `Field Forbidden`,
    'fieldSelection.table.label.unsatisfiable': `Unsatisfiable`,
};

const enUSMessages: ResolvedIntlConfig['messages'] = {
    ...CommonMessages,
    ...CTAs,
    ...Data,
    ...ErrorBoundry,
    ...RouteTitles,
    ...EntitiesHydrator,
    ...FullPage,
    ...Header,
    ...Navigation,
    ...ConfirmationDialog,
    ...LogsDialog,
    ...EntityStatus,
    ...EntityTable,
    ...Home,
    ...PageNotFound,
    ...Registration,
    ...AdminPage,
    ...MonacoEditor,
    ...ConnectorsPage,
    ...Error,
    ...CustomErrors,
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
    ...CustomRenderers,
    ...StorageMappings,
    ...EntityNotFound,
    ...Details,
    ...ExistingEntityCheck,
    ...Docs,
    ...NewTransform,
    ...TaskEndpoints,
    ...DataPlaneAuthReq,
    ...SchemaEditor_Collection,
    ...EntityEvolution,
    ...DraftErrors,
    ...UpdateEntity,
    ...PrefixedName,
    ...Graphs,
    ...FieldSelection,
};

export default enUSMessages;
