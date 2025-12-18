import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

const RETRY_AND_CONTACT =
    'Reload the page and if the issue persists, please contact support.';

export const Details: Record<string, string> = {
    'details.tabs.overview': `Overview`,
    'details.tabs.alerts': `Alerts`,
    'details.tabs.spec': `Spec`,
    'details.tabs.shardStatus': `Status`,
    'details.tabs.history': `History`,
    'details.tabs.ops': `Logs`,

    'details.history.noPublications': `No publications were found.`,
    'details.history.diffFailed': `Unable to get specs to compare.`,
    'details.history.title': `Change History`,
    'details.history.list.title': `Changes`,

    'details.ops.status.cta.formatted': `Dashboard`,
    'details.ops.status.cta.raw': `Code`,
    'details.ops.status.header': `Status`,
    'details.ops.status.message.lastUpdated': `Updated at {timestamp}`,
    'details.ops.status.overview.autoDiscovery.header': `Latest Auto Discovery`,
    'details.ops.status.overview.autoDiscovery.subheaderLastFailure': `Last Failure`,
    'details.ops.status.overview.autoDiscovery.subheaderLastSuccess': `Last Success`,
    'details.ops.status.overview.autoDiscovery.subheaderAdded': `Added`,
    'details.ops.status.overview.autoDiscovery.subheaderModified': `Modified`,
    'details.ops.status.overview.autoDiscovery.subheaderRemoved': `Removed`,
    'details.ops.status.overview.connector.header': `Connector`,
    'details.ops.status.overview.connector.subheaderLastStatus': `Status`,
    'details.ops.status.overview.controller.header': `Controller`,
    'details.ops.status.overview.controller.subheaderActivation': `Data Plane Activation`,
    'details.ops.status.overview.generic.subheaderLastUpdated': `Last Updated`,
    'details.ops.status.overview.menuLabel.details': `View details`,
    'details.ops.status.overview.menuLabel.troubleshoot': `Contact support`,
    'details.ops.status.table.label': `Controller Status History Table`,
    'details.ops.status.table.header': `Recent Controller Events`,
    'details.ops.status.table.empty.header': `No history found`,
    'details.ops.status.table.empty.message': `Click "Refresh" to fetch the latest controller events.`,
    'details.ops.status.table.error.message': `There was an error attempting to fetch controller status events.`,

    'details.settings.notifications.header': `Notification Settings`,
    'details.settings.notifications.alert.userNotSubscribed.message': `You are not subscribed to notifications for this tenant. If you would like to receive notifications for this task, {button} to subscribe.`,
    'details.settings.notifications.alert.userNotSubscribed.message.button': `click here`,
    'details.settings.notifications.alert.createSubscriptionFailed.message': `A issue was encountered subscribing you to notifications for this tenant. Please try again. If the issue persists, ${CTAs['cta.support']}.`,
    'details.settings.notifications.alert.updateSettingsFailed.message': `A issue was encountered updating a notification setting for this task. Please try again. If the issue persists, ${CTAs['cta.support']}.`,
    'details.settings.notifications.dataProcessing.header': `Data Processing`,
    'details.settings.notifications.dataProcessing.noDataProcessedInInterval.message': `Data has not been processed in a given window of time.`,
    'details.settings.notifications.dataProcessing.noDataProcessedInInterval.label': `Interval`,
    'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions.hour': `{interval} {interval, plural, one {Hour} other {Hours}}`,
    'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions.day': `{interval} {interval, plural, one {Day} other {Days}}`,
    'details.settings.notifications.dataProcessing.noDataProcessedInInterval.unsetOption': `None`,

    'details.spec.cta.formatted': `Table`,
    'details.spec.cta.raw': `Code`,

    'details.taskEndpoints.error.message': `An issue was encountered formatting the connector endpoint(s) for this task. ${RETRY_AND_CONTACT}`,

    // Details Panel
    'detailsPanel.logs.title': `Logs`,
    'detailsPanel.logs.notFound': `Logs for this build cannot be found. This is likely a permissions issue. You don't have permissions to view other users' logs by default.`,
    'detailsPanel.shardDetails.fetchError': `Unable to fetch shard status`,
    'detailsPanel.shardDetails.docLink': `Docs`,
    'detailsPanel.shardDetails.title': `Shard Information`,
    'detailsPanel.shardDetails.status.label': `Status`,
    'detailsPanel.shardDetails.id.label': `ID`,
    'detailsPanel.shardDetails.errorTitle': `Shard Replica Processing Errors`,
    'detailsPanel.shardDetails.warningTitle': `Shard Replica Processing Warnings`,
    'detailsPanel.shardDetails.noStatusFound': `No shard status to report`,
    'detailsPanel.shardDetails.docPath': `https://docs.estuary.dev/concepts/advanced/shards/`,
    'detailsPanel.dataPreview.header': `Data Preview`,
    'detailsPanel.dataPreview.failedParsingMessage': `Ran into an problem parsing data. This is a UI bug and does not mean there is an issue with your data.`,
    'detailsPanel.dataPreview.listView.header': `Key`,
    'detailsPanel.dataPreview.hidden': `Data previews are disabled for this tenant.`,

    'detailsPanel.dataPreview.suspended.title': `No data found in collection.`,
    'detailsPanel.dataPreview.suspended.message': `If you are using the ${CommonMessages['company']} trial storage mapping, data expires after 20 days.`,

    'detailsPanel.specification.header': `Specification`,
    'detailsPanel.status.header': `Status`,
    'detailsPanel.details.title': `Details`,
    'detailsPanel.totals.title': `Usage this month`,
    'detailsPanel.recentUsage.title.prefix': `Usage over the past`,
    'detailsPanel.recentUsage.range.label': `Timeframe`,
    'detailsPanel.recentUsage.filter.label.hours': `{range} hours`,
    'detailsPanel.recentUsage.filter.label.days': `{range} days`,
    'detailsPanel.recentUsage.filter.label.months': `{range} months`,
    'detailsPanel.recentUsage.createdAt.label': `Creation hour`,
    'detailsPanel.details.relatedEntity.link': `View details for {catalogName}`,
    'detailsPanel.details.relatedEntity.failed': `failed to find`,

    'detailsPanel.graph.timezone': `{relativeUnit} in`,
    'detailsPanel.graph.syncDelay': `Reporting can be delayed by up to {reportingDelay} for this materialization`,
    'detailsPanel.graph.syncDelay.default': `Reporting can be delayed due to update delay for this materialization`,
    'detailsPanel.graph.syncDelay.tooltip': `Reporting can be delayed by up to 2x the set update delay in the configuration.`,

    'detailsPanel.status.taskDisabled.message': `Task is disabled`,
};
