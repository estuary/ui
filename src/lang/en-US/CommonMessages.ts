export const endpointConfigHeader = `Endpoint Config`;
export const CommonMessages: Record<string, string> = {
    // Misc
    'company': `Estuary`,
    'productName': `Estuary Flow`,
    'expressFlowIntegration': `Powered by Estuary`,
    'common.browserTitle': `Flow`,
    'common.loading': `Loading...`,
    'common.running': `Running...`,
    'common.deleting': `Deleting...`,
    'common.deleted': `Deleted`,
    'common.enabling': `Enabling...`,
    'common.enabled': `Enabled`,
    'common.disabling': `Disabling...`,
    'common.disabled': `Disabled`,
    'common.waiting': `Waiting...`,
    'common.updating': `Updating...`,
    'common.updated': `Updated`,

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
    'common.tenant.creationForm': `Organization`,
    'common.recommended': `Recommended`,
    'common.copied': `Copied`,
    'common.copyFailed': `Failed to copy`,
    'common.synchronizing': `Synchronizing`,
    'common.synchronized': `Synchronized`,
    'common.outOfSync': `Out of Sync`,
    'common.readOnly': `Read-Only`,
    'common.failedFetch': `Unable to reach server`,
    'common.missingError': `Something went wrong`,
    'common.exampleName': `marketing_data`,
    'common.removing': `Removing...`,
    'common.removed': `Removed`,
    'common.default': `Default`,
    'common.public': `Public`,
    'common.private': `Private`,
    'common.pending': `Pending`,
    'common.upToDate': `Up-to-date`,
    'common.unknown': `Unknown`,

    // Aria
    'aria.openExpand': `show more`,
    'aria.closeExpand': `show less`,

    // Terms
    'terms.connectors': `Connectors`,
    'terms.collections': `Collections`,
    'terms.bindings': `Bindings`,
    'terms.permissions': `Access Grants`,
    'terms.materialization': `Materialization`,
    'terms.transformation': `Transformation`,
    'terms.capture': `Capture`,
    'terms.derivation': `Derivation`,
    'terms.documentation': `Docs`,
    'terms.entity': `Entity`,
    'terms.dataFlow': `Data Flow`,
    'terms.source': `Source`,
    'terms.sources': `Sources`,
    'terms.destination': `Destination`,
    'terms.destinations': `Destinations`,
    'terms.destination.lowercase': `destination`,
    'terms.destinations.lowercase': `destinations`,

    // Terms V2
    // Not 100% sure on this approach yet. Like keeping all this together.
    //  However, when translating it can lead to extra translations. Also, this
    //  is just how react-intl handles it and we might end up rolling our own.
    'terms.bindings.plural': `{count, plural, one {binding} other {bindings}}`,
    'terms.collections.plural': `{count, plural, one {collection} other {collections}}`,
    'terms.destinations.plural': `{count, plural, one {destination} other {destinations}}`,
    'terms.sources.plural': `{count, plural, one {source} other {sources}}`,

    // Common fields
    'entityPrefix.label': `Prefix`,
    'entityPrefix.description': `Prefix for the entity name.`,
    'entityName.label': `Name`,
    'connector.label': `Connector`,
    'connector.description': `The external system you're connecting to.`,
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
    'directives.grant.skipped.title': `Access Grant Token Skipped`,
    'directives.grant.skipped.message': `The access grant link you submitted was not applied as you already have the requested access.`,

    // User in filters for tables
    'filter.time.label': `Stats Range`,
    'filter.time.today': `Today`,
    'filter.time.yesterday': `Yesterday`,
    'filter.time.lastWeek': `Last Week`,
    'filter.time.thisWeek': `This Week`,
    'filter.time.lastMonth': `Last Month`,
    'filter.time.thisMonth': `This Month`,
    'filter.time.allTime': `All Time`,

    'catalogName.limitations': `letters, numbers, periods, underscores, and hyphens`,

    'support.email': `mailto:support@estuary.dev`,

    // Confirmation Dialog
    'confirm.title': `Are you sure?`,
    'confirm.loseData': `You have unsaved work. If you continue, you will lose your changes.`,
    'confirm.oauth': `You are in the process of OAuth. If you continue, you will lose your changes.`,

    // TODO (entity-status): Reassess once a decision is made regarding the language
    //   used to contextualize entity status.
    // Status
    'status.error.high': `High`,
    'status.error.low': `Low`,
    'status.error.medium': `Medium`,
};
