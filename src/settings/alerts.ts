import type { AlertSetting } from 'src/settings/types';
import type { AlertType } from 'src/types/gql';

export const ALERT_SETTING: { [k in AlertType]: AlertSetting } = {
    auto_discover_failed: {
        detailKeys: ['error'],
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.auto_discover_failed',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.auto_discover_failed',
    },
    shard_failed: {
        detailKeys: [],
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.shard_failed',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.shard_failed',
    },
    data_movement_stalled: {
        detailKeys: ['evaluation_interval'],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#data-movement-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.datamovementstalled',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.datamovementstalled',
    },
    free_trial: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.freetrial',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.freetrial',
    },
    free_trial_ending: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.freetrialending',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.freetrialending',
    },
    free_trial_stalled: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.freetrialstalled',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.freetrialstalled',
    },
    missing_payment_method: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.missingpaymentmethod',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.missingpaymentmethod',
    },
};
