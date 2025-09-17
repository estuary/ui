export const Alerts: Record<string, string> = {
    'alerts.config.title': `Alerts`,
    'alerts.config.message': `Below are tasks with an active alert. If you have taken steps to fix they may take some time to clear.`,
    'alerts.config.header': `Organization Notifications`,
    'alerts.config.cta.addAlertMethod': `Configure Notifications`,

    'alerts.config.dialog.description': `Choose where you'd like notifications to be sent. To add an email address, select from the list of admin user emails or enter custom email addresses as a comma separated list.`,
    'alerts.config.dialog.emailSelector.inputError': `One or more emails are not formatted properly.`,
    'alerts.config.dialog.generate.header': `Configure Notification Methods`,
    'alerts.config.dialog.update.header': `Update Notification Methods`,

    'alerts.config.table.aria.label': `Organization Notifications Table`,
    'alerts.config.table.filterLabel': `Filter by Prefix or Email`,
    'alerts.config.table.noContent.header': `No subscriptions found.`,
    'alerts.config.table.noContent.message': `To begin receiving email notifications for a prefix you admin, click "Configure Notifications" above to create a subscription.`,
    'alerts.config.table.label.alertMethod': `Notification Method`,

    'alerts.overview.title.fetching': `Fetching active alerts...`,
    'alerts.overview.title.active': `Active Alerts`,
    'alerts.overview.title.activeEmpty': `No Active Alerts`,

    'alerts.overview.recentAlerts': `Recent Alerts`,
    'alerts.overview.label': `List of most recent alerts grouped by name`,

    'alerts.details.title': `Alert Details`,
    'alerts.details.preview': `...{lineCount} lines hidden`,

    'alerts.history.title.active': `Resolved Alerts`,
    'alerts.table.data.firedAt': `Fired At`,
    'alerts.table.data.recipients': `Recipients`,
    'alerts.table.data.resolvedAt': `Resolved At`,
    'alerts.table.data.duration': `Duration`,
    'alerts.table.data.alertType': `Alert Type`,
    'alerts.table.data.details': `Details`,
    'alerts.table.label': `List of all alerts for tenant`,
    'alerts.table.empty.header': `No alerts found`,
    'alerts.table.empty.message': `No resolved alerts`,
    'alerts.table.error.message': `There was an error attempting to fetch resolved alerts.`,

    'alert.active.fetchError.title': `Unable to fetch active alerts`,

    'alert.active.noAlerts.title': `All Clear!`,
    'alert.active.noAlerts.message': `No active alerts.`,

    // Consumed in ui/src/settings/alerts.ts and ui/src/hooks/useAlertTypeContent.ts
    'alerts.alertType.humanReadable.auto_discover_failed': `Auto Discover Failed`,
    'alerts.alertType.humanReadable.shard_failed': `Shard Failure`,
    'alerts.alertType.humanReadable.data_movement_stalled': `Data Movement Stalled`,
    'alerts.alertType.humanReadable.free_trial': ``,
    'alerts.alertType.humanReadable.free_trial_ending': `Free Trial Ending`,
    'alerts.alertType.humanReadable.free_trial_stalled': ``,
    'alerts.alertType.humanReadable.missing_payment_method': `Missing Payment Method`,

    'alerts.alertType.details.humanReadable.error': `Details`,
    'alerts.alertType.details.humanReadable.evaluation_interval': `Details`,
    'alerts.alertType.details.humanReadable.recipients': `Notification Recipients`,
    'alerts.alertType.details.humanReadable.spec_type': `Spec Type`,
};
