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

    'alerts.table.data.firedAt': `Fired At`,
    'alerts.table.data.recipients': `Recipients`,
    'alerts.table.data.resolvedAt': `Resolved At`,
    'alerts.table.data.duration': `Duration`,
    'alerts.table.data.alertType': `Alert Type`,
    'alerts.table.data.details': `Details`,
    'alerts.table.label': `List of all alerts for tenant`,
    'alerts.table.empty.header': `No alerts found`,
    'alerts.table.empty.message': `This tenant has no historical alerts`,
    'alerts.table.error.message': `There was an error attempting to fetch alert history.`,

    'alert.active.fetchError.title': `Unable to fetch unresolved alerts`,

    'alert.active.noAlerts.title': `All Clear!`,
    'alert.active.noAlerts.message': `There are no unresolved alerts for this task.`,

    // Consumed in ui/src/settings/alerts.ts and ui/src/hooks/useAlertTypeContent.ts
    'alerts.alertType.humanReadable.auto_discover_failed': `Auto Discover Failed`,
    'alerts.alertType.humanReadable.explanation.auto_discover_failed': `There wasn an issue when we tried to automatically update the schema for the task.`,

    'alerts.alertType.humanReadable.shard_failed': `Shard Failure`,
    'alerts.alertType.humanReadable.explanation.shard_failed': `Shard Failure explanation`,

    'alerts.alertType.humanReadable.data_movement_stalled': `Data Movement Stalled`,
    'alerts.alertType.humanReadable.explanation.data_movement_stalled': `The entity is still running but has not need data for some time.`,

    'alerts.alertType.humanReadable.free_trial': ``,
    'alerts.alertType.humanReadable.explanation.free_trial': ``,

    'alerts.alertType.humanReadable.free_trial_ending': `Free Trial Ending`,
    'alerts.alertType.humanReadable.explanation.free_trial_ending': `Free Trial Ending explanation`,

    'alerts.alertType.humanReadable.free_trial_stalled': ``,
    'alerts.alertType.humanReadable.explanation.free_trial_stalled': ``,

    'alerts.alertType.humanReadable.missing_payment_method': `Missing Payment Method`,
    'alerts.alertType.humanReadable.explanation.missing_payment_method': `Missing Payment Method explanation`,

    'alerts.alertType.details.humanReadable.error': `Server Error`,
    'alerts.alertType.details.humanReadable.evaluation_interval': `Evaluation Interval`,
    'alerts.alertType.details.humanReadable.recipients': `Notification Recipients`,
    'alerts.alertType.details.humanReadable.spec_type': `Spec Type`,
};
