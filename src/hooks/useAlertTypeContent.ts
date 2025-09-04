import type { Alert } from 'src/types/gql';

import { useCallback } from 'react';

import { useIntl } from 'react-intl';

import { ALERT_SETTING } from 'src/settings/alerts';

function useAlertTypeContent() {
    const intl = useIntl();

    return useCallback(
        ({ alertType, alertDetails }: Alert) => {
            if (alertType && ALERT_SETTING[alertType]) {
                let DetailSection: any = null;
                const details: any[] = [];

                if (ALERT_SETTING[alertType].detailKeys.length > 0) {
                    ALERT_SETTING[alertType].detailKeys.forEach((detailKey) => {
                        details.push({
                            label: intl.formatMessage({
                                id: `alerts.alertType.details.humanReadable.${detailKey}`,
                            }),
                            dataVal: alertDetails[detailKey],
                            key: detailKey,
                        });
                    });
                }

                if (ALERT_SETTING[alertType].detailSection) {
                    DetailSection = ALERT_SETTING[alertType].detailSection;
                }

                return {
                    DetailSection,
                    details,
                    docLink: ALERT_SETTING[alertType].docLink,
                    humanReadable: intl.formatMessage({
                        id: ALERT_SETTING[alertType].humanReadableIntlKey,
                    }),
                    explanation: intl.formatMessage({
                        id: ALERT_SETTING[alertType].explanationIntlKey,
                    }),
                };
            }

            return {
                details: [],
                humanReadable: '',
                explanation: '',
            };
        },
        [intl]
    );
}

export default useAlertTypeContent;
