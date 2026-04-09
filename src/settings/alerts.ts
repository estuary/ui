import type { AlertType } from 'src/gql-types/graphql';
import type { AlertSetting } from 'src/settings/types';

export const ALERT_SETTING: { [k in AlertType]: AlertSetting } = {
    auto_discover_failed: {
        detailKey: 'error',
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.auto_discover_failed',
    },
    background_publication_failed: {
        detailKey: 'error',
        docLink:
            'https://docs.estuary.dev/reference/notifications/#background-publication-failed-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.background_publication_failed',
    },
    shard_failed: {
        detailKey: 'error',
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.shard_failed',
    },
    data_movement_stalled: {
        detailKey: 'evaluation_interval',
        docLink:
            'https://docs.estuary.dev/reference/notifications/#data-movement-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.data_movement_stalled',
    },
    free_trial: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.free_trial',
    },
    free_trial_ending: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.free_trial_ending',
    },
    free_trial_stalled: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.free_trial_stalled',
    },
    missing_payment_method: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.missing_payment_method',
    },
    task_auto_disabled_failing: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#task-failure-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.task_auto_disabled_failing',
    },
    task_chronically_failing: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#task-failure-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.task_chronically_failing',
    },
    task_auto_disabled_idle: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#task-failure-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.task_auto_disabled_idle',
    },
    task_idle: {
        detailKey: null,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#task-failure-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.task_idle',
    },
};
