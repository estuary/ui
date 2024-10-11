import { CTAs } from './CTAs';

export const Details: Record<string, string> = {
    'details.tabs.overview': `Overview`,
    'details.tabs.spec': `Spec`,
    'details.tabs.shardStatus': `Status`,
    'details.tabs.history': `History`,
    'details.tabs.ops': `Logs`,

    'details.history.noPublications': `No publications were found.`,

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

    'details.taskEndpoints.error.message': `An issue was encountered formatting the connector endpoint(s) for this task. Reload the page and if the issue persists, please contact support.`,

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
