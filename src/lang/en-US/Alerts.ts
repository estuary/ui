export const Alerts: Record<string, string> = {
    'admin.notifications.title': `Active Alerts`,
    'admin.notifications.message': `Below is all entities that have an active alert`,

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

    // Consumed in ui/src/settings/alerts.ts and ui/src/hooks/useAlertTypeContent.ts
    'alerts.alertType.humanReadable.autodiscoverfailed': `Auto Discover Failed`,
    'alerts.alertType.humanReadable.explanation.autodiscoverfailed': `The entity was unable to connect to the source system to automatically update the schema.`,

    'alerts.alertType.humanReadable.shardfailed': `Shard Failure`,
    'alerts.alertType.humanReadable.explanation.shardfailed': `Shard Failure explanation`,

    'alerts.alertType.humanReadable.datamovementstalled': `Data Movement Stalled`,
    'alerts.alertType.humanReadable.explanation.datamovementstalled': `The entity is still running but has not need data for some time.`,

    'alerts.alertType.humanReadable.freetrial': ``,
    'alerts.alertType.humanReadable.explanation.freetrial': ``,

    'alerts.alertType.humanReadable.freetrialending': `Free Trial Ending`,
    'alerts.alertType.humanReadable.explanation.freetrialending': `Free Trial Ending explanation`,

    'alerts.alertType.humanReadable.freetrialstalled': ``,
    'alerts.alertType.humanReadable.explanation.freetrialstalled': ``,

    'alerts.alertType.humanReadable.missingpaymentmethod': `Missing Payment Method`,
    'alerts.alertType.humanReadable.explanation.missingpaymentmethod': `Missing Payment Method explanation`,

    'alerts.alertType.details.humanReadable.evaluation_interval': `Evaluation Interval`,
    'alerts.alertType.details.humanReadable.recipients': `Notification Recipients`,
    'alerts.alertType.details.humanReadable.spec_type': `Spec Type`,
};
