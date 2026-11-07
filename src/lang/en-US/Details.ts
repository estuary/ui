import { CTAs } from 'src/lang/en-US/CTAs';

const RETRY_AND_CONTACT =
    'Reload the page and if the issue persists, please contact support.';

export const Details: Record<string, string> = {
    'details.tabs.overview': `Overview`,
    'details.tabs.alerts': `Alerts`,
    'details.tabs.spec': `Spec`,
    'details.tabs.history': `History`,
    'details.tabs.ops': `Logs`,

    'details.ops.status.overview.autoDiscovery.subheaderLastFailure': `Last Failure`,
    'details.ops.status.overview.autoDiscovery.subheaderLastSuccess': `Last Success`,
    'details.ops.status.overview.autoDiscovery.subheaderAdded': `Added`,
    'details.ops.status.overview.autoDiscovery.subheaderModified': `Modified`,
    'details.ops.status.overview.autoDiscovery.subheaderRemoved': `Removed`,

    'details.ops.status.overview.connector.subheaderLastStatus': `Status`,

    'details.ops.status.overview.controller.subheaderActivation': `Data Plane Activation`,
    'details.ops.status.overview.generic.subheaderLastUpdated': `Last Updated`,

    'details.ops.status.table.empty.header': `No history found`,
    'details.ops.status.table.empty.message': `Click "Refresh" to fetch the latest controller events.`,
    'details.ops.status.table.error.message': `There was an error attempting to fetch controller status events.`,

    'details.settings.notifications.alert.userNotSubscribed.message': `You are not subscribed to notifications for this tenant. If you would like to receive notifications for this task, {button} to subscribe.`,
    'details.settings.notifications.alert.userNotSubscribed.message.button': `click here`,
    'details.settings.notifications.alert.createSubscriptionFailed.message': `A issue was encountered subscribing you to notifications for this tenant. Please try again. If the issue persists, ${CTAs['cta.support']}.`,
    'details.settings.notifications.alert.updateSettingsFailed.message': `A issue was encountered updating a notification setting for this task. Please try again. If the issue persists, ${CTAs['cta.support']}.`,

    'details.taskEndpoints.error.message': `An issue was encountered formatting the connector endpoint(s) for this task. ${RETRY_AND_CONTACT}`,

    // Details Panel

    'detailsPanel.shardDetails.title': `Shard Information`,
    'detailsPanel.shardDetails.status.label': `Status`,
    'detailsPanel.shardDetails.id.label': `ID`,

    'detailsPanel.shardDetails.docPath': `https://docs.estuary.dev/concepts/advanced/shards/`,

    'detailsPanel.recentUsage.title.prefix': `Usage over the past`,
    'detailsPanel.recentUsage.filter.label.hours': `{range} hours`,
    'detailsPanel.recentUsage.filter.label.days': `{range} days`,
    'detailsPanel.recentUsage.filter.label.months': `{range} months`,
    'detailsPanel.recentUsage.filter.label.year': `Year`,
};
