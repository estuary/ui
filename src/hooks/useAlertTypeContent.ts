import type { Alert } from 'src/types/gql';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { ALERT_SETTING } from 'src/settings/alerts';

function useAlertTypeContent({ alertType, alertDetails }: Alert) {
    const intl = useIntl();

    return useMemo(() => {
        if (alertType && ALERT_SETTING[alertType]) {
            const details: any[] = [];

            if (ALERT_SETTING[alertType].detailKeys.length > 0) {
                ALERT_SETTING[alertType].detailKeys.forEach((detailKey) => {
                    details.push({
                        label: intl.formatMessage({
                            id: `alertType.details.${detailKey}`,
                        }),
                        dataVal: alertDetails[detailKey],
                        key: detailKey,
                    });
                });
            }

            return {
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
    }, [alertDetails, alertType, intl]);
}

export default useAlertTypeContent;
