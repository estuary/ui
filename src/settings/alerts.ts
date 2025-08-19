import type { AlertSetting } from 'src/settings/types';
import type { AlertType } from 'src/types/gql';

export const ALERT_SETTING: { [k in AlertType]: AlertSetting } = {
    autodiscoverfailed: {
        detailKeys: [],
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey:
            'admin.notifications.alertType.autodiscoverfailed',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.autodiscoverfailed',
    },
    shardfailed: {
        detailKeys: [],
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey: 'admin.notifications.alertType.shardfailed',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.shardfailed',
    },
    datamovementstalled: {
        detailKeys: ['evaluation_interval'],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#data-movement-alerts',
        humanReadableIntlKey:
            'admin.notifications.alertType.datamovementstalled',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.datamovementstalled',
    },
    freetrial: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'admin.notifications.alertType.freetrial',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.freetrial',
    },
    freetrialending: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'admin.notifications.alertType.freetrialending',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.freetrialending',
    },
    freetrialstalled: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'admin.notifications.alertType.freetrialstalled',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.freetrialstalled',
    },
    missingpaymentmethod: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'admin.notifications.alertType.missingpaymentmethod',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.missingpaymentmethod',
    },
};
