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

    'details.toolbar.copyName': `Copy name`,

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
    // Decision: the explainer is named for the question, not "Docs".
    'detailsPanel.shardDetails.explainerLink': `What is a shard?`,
    'detailsPanel.shardDetails.docPath': `https://docs.estuary.dev/concepts/advanced/shards/`,
    'detailsPanel.dataPreview.header': `Data Preview`,
    'detailsPanel.dataPreview.failedParsingMessage': `Ran into an problem parsing data. This is a UI bug and does not mean there is an issue with your data.`,
    'detailsPanel.dataPreview.listView.header': `Keys`,
    'detailsPanel.dataPreview.hidden': `Data previews are disabled for this tenant.`,

    'detailsPanel.dataPreview.suspended.title': `No data found in collection.`,
    'detailsPanel.dataPreview.suspended.message': `If you are using the ${CommonMessages['company']} trial storage mapping, data expires after 20 days.`,

    'detailsPanel.specification.header': `Specification`,
    'detailsPanel.status.header': `Status`,
    'detailsPanel.details.title': `Details`,
    'detailsPanel.totals.title': `Usage this month`,
    // Reads as a card heading followed by its range picker: "Data Movement
    // [48 hours]". Shared with the collection details page, whose chart is the
    // same chart.
    'detailsPanel.recentUsage.title.prefix': `Data Movement`,
    'detailsPanel.recentUsage.range.label': `Timeframe`,
    'detailsPanel.rangeChip.tooltip': `Covers the timeframe selected at the top of the page.`,
    'detailsPanel.recentUsage.filter.label.hours': `{range} hours`,
    'detailsPanel.recentUsage.filter.label.days': `{range} days`,
    'detailsPanel.recentUsage.filter.label.months': `{range} months`,
    'detailsPanel.recentUsage.filter.label.year': `Year`,
    'detailsPanel.recentUsage.createdAt.label': `Creation hour`,
    'detailsPanel.details.relatedEntity.link': `View details for {catalogName}`,
    'detailsPanel.details.relatedEntity.failed': `failed to find`,

    'detailsPanel.graph.timezone': `{relativeUnit} in`,
    'detailsPanel.graph.syncDelay': `Reporting can be delayed by up to {reportingDelay} for this materialization`,
    'detailsPanel.graph.syncDelay.default': `Reporting can be delayed due to update delay for this materialization`,
    'detailsPanel.graph.syncDelay.tooltip': `Reporting can be delayed by up to 2x the set update delay in the configuration.`,

    'detailsPanel.status.taskDisabled.message': `Task is disabled`,

    // Two surfaces, as decision #9 required: the Alerts tab's count badge and
    // this panel. #9 also said no permanent alerts surface — that part is
    // deliberately reversed, so the panel is always beside the chart and its
    // dot goes green when nothing is firing.
    'detailsPanel.alerts.panel.title': `Alerts`,
    'detailsPanel.alerts.panel.none': `No alerts firing.`,

    // Elapsed-time units. Minutes are the finest on purpose — the reporting
    // pipeline floors at roughly four, so seconds would be invented precision.
    // Bare units. Freshness is an age — "1 minute" — while the bindings
    // table's Last data is a point in time, so only that wraps them in "ago".
    'detailsPanel.elapsed.minutes': `{count, plural, one {minute} other {minutes}}`,
    'detailsPanel.elapsed.hours': `{count, plural, one {hour} other {hours}}`,
    'detailsPanel.elapsed.days': `{count, plural, one {day} other {days}}`,
    'detailsPanel.elapsed.ago': `{elapsed} ago`,

    // Status strip — the page's status line, laid out horizontally under the tabs.
    'detailsPanel.strip.freshness': `Freshness`,
    'detailsPanel.strip.freshness.tooltip': `How long ago the newest document across all of this task's bindings was published. Stats take about four minutes to reach this page, so a steady few minutes is the reporting delay rather than lag.`,
    'detailsPanel.strip.freshness.none': `No data yet`,
    'detailsPanel.strip.freshness.none.tooltip': `No binding moved data in the range selected on the chart above.`,
    // Replaced a plain collection count, which the bindings card heading and
    // its filter chips both already state further down the page.
    'detailsPanel.strip.dataMoved': `Data moved`,
    'detailsPanel.strip.dataMoved.tooltip': `Total across every binding for the selected range. Written for a capture, read for a materialization — the same figure the chart plots.`,
    'detailsPanel.strip.autoDiscover': `Auto-discover`,
    'detailsPanel.strip.autoDiscover.last': `Last`,
    'detailsPanel.strip.autoDiscover.next': `Next`,
    'detailsPanel.strip.never': `never`,
    // "Status" rather than "Shards": the product's own alert copy already calls
    // this condition a Task Failure, and a term needing a tooltip is the wrong label.
    'detailsPanel.strip.status': `Status`,
    'detailsPanel.strip.status.running': `Running`,
    'detailsPanel.strip.status.failed': `Failed`,
    'detailsPanel.strip.status.warning': `Warnings`,
    'detailsPanel.strip.status.disabled': `Disabled`,
    'detailsPanel.strip.status.viewAlerts': `View this in Alerts`,
    // The product's own term for this, taken from
    // spec.endpoint.connector.config.syncSchedule.syncFrequency. Never "commit delay".
    // The connector's own account of what it is doing, which is not the same
    // fact as the Status cell's shard state — a task can be Running while the
    // connector is mid-backfill.
    'detailsPanel.strip.connectorStatus.tooltip': `Reported by the connector: {message}`,
    'detailsPanel.strip.syncSchedule': `Sync schedule`,
    'detailsPanel.strip.syncSchedule.inline': `(sync schedule {frequency})`,
    'detailsPanel.strip.syncSchedule.tooltip': `Where a sync schedule is set, a steady lag near its value is expected behaviour rather than a backlog.`,
    'detailsPanel.strip.footer.updated': `Updated {timestamp}`,
    'detailsPanel.strip.footer.created': `Created {timestamp}`,
    'detailsPanel.strip.footer.connectorDocs': `Connector docs`,

    // Bindings table.
    'detailsPanel.bindings.title': `Bindings`,
    'detailsPanel.bindings.table.aria': `Bindings`,
    // The chip's text is the range itself, formatted from the same keys
    // DetailsRange labels its picker with — see BindingsCardHeader.
    'detailsPanel.bindings.subtitle.written': `{count, plural, one {# binding} other {# bindings}} · {volume} written`,
    'detailsPanel.bindings.subtitle.read': `{count, plural, one {# binding} other {# bindings}} · {volume} read`,
    'detailsPanel.bindings.search.capture': `Filter by source stream or collection`,
    'detailsPanel.bindings.search.materialization': `Filter by collection`,
    'detailsPanel.bindings.filter.all': `All`,
    'detailsPanel.bindings.rowsPerPage': `Bindings per page`,
    'detailsPanel.bindings.empty': `This task has no bindings.`,
    'detailsPanel.bindings.noMatches': `No bindings match this filter.`,
    // "Enabled" rather than "Active": the flag only says the binding is not
    // switched off, which is not a claim that data is flowing.
    'detailsPanel.bindings.status.enabled': `Enabled`,
    'detailsPanel.bindings.status.disabled': `Disabled`,
    'detailsPanel.bindings.column.sourceStream': `Source stream`,
    'detailsPanel.bindings.column.collection': `Collection`,
    'detailsPanel.bindings.column.status': `Status`,
    'detailsPanel.bindings.column.docs': `Docs`,
    'detailsPanel.bindings.column.dataWritten': `Data written`,
    'detailsPanel.bindings.column.dataRead': `Data read`,
    'detailsPanel.bindings.column.lastData': `Last data`,
    // The bar is relative to the busiest binding, which is good for comparing
    // rows but says nothing about how much of the task a row accounts for — so
    // the tooltip carries the share instead.
    'detailsPanel.bindings.volume.tooltip': `{share} of this task's total for the selected range. Bar length is relative to the largest binding.`,
    'detailsPanel.bindings.volume.none.tooltip': `No data recorded for this binding in the selected range.`,
};
