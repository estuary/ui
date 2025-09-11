import type { AlertSetting } from 'src/settings/types';
import type { AlertType } from 'src/types/gql';

import AutoDiscoverFailedDetail from 'src/components/shared/Entity/Details/Alerts/Details/AutoDiscoverFailedDetail';
import DataMovementStalledDetail from 'src/components/shared/Entity/Details/Alerts/Details/DataMovementStalledDetail';

export const ALERT_SETTING: { [k in AlertType]: AlertSetting } = {
    auto_discover_failed: {
        detailKeys: ['error'],
        detailSection: AutoDiscoverFailedDetail,
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.auto_discover_failed',
    },
    shard_failed: {
        detailKeys: ['error'],
        detailSection: DataMovementStalledDetail,
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.shard_failed',
    },
    data_movement_stalled: {
        detailKeys: ['evaluation_interval'],
        detailSection: DataMovementStalledDetail,
        docLink:
            'https://docs.estuary.dev/reference/notifications/#data-movement-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.data_movement_stalled',
    },
    free_trial: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.free_trial',
    },
    free_trial_ending: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.free_trial_ending',
    },
    free_trial_stalled: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.free_trial_stalled',
    },
    missing_payment_method: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.missing_payment_method',
    },
};
