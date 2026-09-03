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
    'detailsPanel.recentUsage.title.prefix': `Usage over the past`,
    'detailsPanel.recentUsage.range.label': `Timeframe`,
    'detailsPanel.rangeChip.tooltip': `Covers the timeframe selected on the chart above.`,
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

    // Elapsed-time units. Minutes are the finest on purpose — the reporting
    // pipeline floors at roughly four, so seconds would be invented precision.
    // Bare units, because the bindings table's Last data wraps them in "ago".
    'detailsPanel.elapsed.minutes': `{count, plural, one {minute} other {minutes}}`,
    'detailsPanel.elapsed.hours': `{count, plural, one {hour} other {hours}}`,
    'detailsPanel.elapsed.days': `{count, plural, one {day} other {days}}`,
    'detailsPanel.elapsed.ago.suffix': `ago`,

    // Bindings table — internal name only; the user-facing word is
    // "collections", not "bindings" (see `terms.collections`). The card
    // heading and the table's accessible name both come from that shared key,
    // and `{unit}` below from `terms.collections.plural`, so the word is not
    // restated here.
    //
    // The chip beside the heading carries the range itself, formatted through
    // `getRangeLabelDescriptor` — see RangeChip.
    'detailsPanel.bindings.subtitle.written': `{count} {unit} · {volume} written`,
    'detailsPanel.bindings.subtitle.read': `{count} {unit} · {volume} read`,
    'detailsPanel.bindings.search.capture': `Filter by source stream or collection`,
    'detailsPanel.bindings.search.materialization': `Filter by collection`,
    'detailsPanel.bindings.search.clear': `Clear search`,
    'detailsPanel.bindings.filter.all': `All`,
    'detailsPanel.bindings.rowsPerPage': `Collections per page`,
    'detailsPanel.bindings.empty': `This task has no collections.`,
    'detailsPanel.bindings.noMatches': `No collections match this filter.`,
    'detailsPanel.bindings.clearFilter': `Clear filter`,
    // "Enabled" rather than "Active": the flag only says the binding is not
    // switched off, which is not a claim that data is flowing.
    'detailsPanel.bindings.status.enabled': `Enabled`,
    'detailsPanel.bindings.status.disabled': `Disabled`,
    // Enabled, but nothing moved through it in the selected range, and the
    // connector itself isn't reporting errors — a benign quiet, not a failure.
    'detailsPanel.bindings.status.noData': `No data`,
    'detailsPanel.bindings.status.noData.tooltip': `Enabled, but no documents were captured in the selected range.`,
    'detailsPanel.bindings.column.sourceStream': `Source stream`,
    'detailsPanel.bindings.column.collection': `Collection`,
    'detailsPanel.bindings.column.status': `Status`,
    'detailsPanel.bindings.column.docs': `Docs`,
    'detailsPanel.bindings.column.dataWritten': `Data written`,
    'detailsPanel.bindings.column.dataRead': `Data read`,
    'detailsPanel.bindings.column.lastData': `Last data`,
    // Materialization only — a capture has no upstream frontier to be behind.
    'detailsPanel.bindings.column.bytesBehind': `Bytes behind`,
    'detailsPanel.bindings.column.secondsBehind': `Time behind`,
    'detailsPanel.bindings.download': `Download CSV`,
    // The bar is relative to the busiest collection, which is good for
    // comparing rows but says nothing about how much of the task a row
    // accounts for (the tooltip carries the share instead) or how far behind
    // it is (that's the separate lag columns, materialization-only) — spelled
    // out explicitly because a length bar reads as a progress/lag indicator
    // by default, and this one is neither.
    'detailsPanel.bindings.volume.tooltip': `{share} of this task's total volume for the selected range — not a lag or progress indicator. Bar length is relative to the busiest collection.`,
    'detailsPanel.bindings.volume.none.tooltip': `No data recorded for this binding in the selected range.`,
    // Both lag figures read from the same gauge, so both tooltips carry the same
    // hedge: it is a delta-sum that is only re-anchored on a fresh reading, not
    // recomputed live, so a binding that has already caught up can still show a
    // stale nonzero figure for a while. Directional, not authoritative.
    'detailsPanel.bindings.bytesBehind.tooltip': `Bytes still to write, as of the task's last stats reading rather than the selected range. Directional, not exact.`,
    'detailsPanel.bindings.bytesBehind.none.tooltip': `No backlog reading yet for this binding.`,
    'detailsPanel.bindings.secondsBehind.tooltip': `Lag in source-publication time, as of the task's last stats reading rather than the selected range. Directional, not exact.`,
    'detailsPanel.bindings.secondsBehind.none.tooltip': `No time-lag reading yet for this binding.`,
    // Shared by both lag columns for the zero case, which is a real answer
    // (nothing left to read) rather than a missing one — see the "none" variants
    // above for that case instead.
    'detailsPanel.bindings.behind.caughtUp': `Caught up`,
};
