import type { AlertSetting } from 'src/settings/types';
import type { AlertType } from 'src/types/gql';

export const ALERT_SETTING: { [k in AlertType]: AlertSetting } = {
    autodiscoverfailed: {
        detailKeys: [],
        humanReadableIntlKey:
            'admin.notifications.alertType.autodiscoverfailed',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.autodiscoverfailed',
    },
    shardfailed: {
        detailKeys: [],
        humanReadableIntlKey: 'admin.notifications.alertType.shardfailed',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.shardfailed',
    },
    datamovementstalled: {
        detailKeys: [],
        humanReadableIntlKey:
            'admin.notifications.alertType.datamovementstalled',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.datamovementstalled',
    },
    freetrial: {
        detailKeys: [],
        humanReadableIntlKey: 'admin.notifications.alertType.freetrial',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.freetrial',
    },
    freetrialending: {
        detailKeys: [],
        humanReadableIntlKey: 'admin.notifications.alertType.freetrialending',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.freetrialending',
    },
    freetrialstalled: {
        detailKeys: [],
        humanReadableIntlKey: 'admin.notifications.alertType.freetrialstalled',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.freetrialstalled',
    },
    missingpaymentmethod: {
        detailKeys: [],
        humanReadableIntlKey:
            'admin.notifications.alertType.missingpaymentmethod',
        explanationIntlKey:
            'admin.notifications.alertType.explanation.missingpaymentmethod',
    },
};
