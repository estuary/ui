import type { AlertTypeContent } from 'src/components/shared/Entity/Details/Alerts/types';
import type { Alert } from 'src/types/gql';

import { useCallback } from 'react';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import { ALERT_SETTING } from 'src/settings/alerts';

function useAlertTypeContent() {
    const intl = useIntl();

    return useCallback(
        ({
            alertType,
            alertDetails,
            firedAt,
            resolvedAt,
        }: Alert): AlertTypeContent => {
            if (alertType && ALERT_SETTING[alertType]) {
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

                const response: AlertTypeContent = {
                    details,
                    docLink: ALERT_SETTING[alertType].docLink,
                    humanReadable: intl.formatMessage({
                        id: ALERT_SETTING[alertType].humanReadableIntlKey,
                    }),
                    firedAtReadable: DateTime.fromISO(firedAt)
                        .toUTC()
                        .toLocaleString(DateTime.DATETIME_FULL),
                    resolvedAtReadable: !resolvedAt
                        ? ''
                        : DateTime.fromISO(resolvedAt)
                              .toUTC()
                              .toLocaleString(DateTime.DATETIME_FULL),
                };

                if (ALERT_SETTING[alertType].detailSection) {
                    response.DetailSection =
                        ALERT_SETTING[alertType].detailSection;
                }

                return response;
            }

            return {
                details: [],
                humanReadable: '',
                firedAtReadable: '',
                resolvedAtReadable: '',
            };
        },
        [intl]
    );
}

export default useAlertTypeContent;
