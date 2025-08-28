import type { AlertSetting } from 'src/settings/types';
import type { AlertType } from 'src/types/gql';

export const ALERT_SETTING: { [k in AlertType]: AlertSetting } = {
    autodiscoverfailed: {
        detailKeys: [],
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.autodiscoverfailed',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.autodiscoverfailed',
    },
    shardfailed: {
        detailKeys: [],
        docLink: 'https://docs.estuary.dev/reference/notifications',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.shardfailed',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.shardfailed',
    },
    datamovementstalled: {
        detailKeys: ['evaluation_interval'],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#data-movement-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.datamovementstalled',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.datamovementstalled',
    },
    freetrial: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.freetrial',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.freetrial',
    },
    freetrialending: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.freetrialending',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.freetrialending',
    },
    freetrialstalled: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey: 'alerts.alertType.humanReadable.freetrialstalled',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.freetrialstalled',
    },
    missingpaymentmethod: {
        detailKeys: [],
        docLink:
            'https://docs.estuary.dev/reference/notifications/#billing-alerts',
        humanReadableIntlKey:
            'alerts.alertType.humanReadable.missingpaymentmethod',
        explanationIntlKey:
            'alerts.alertType.humanReadable.explanation.missingpaymentmethod',
    },
};
