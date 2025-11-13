import type { ChipDisplay } from 'src/components/shared/ChipList/types';
import type {
    AlertDetail,
    AlertTypeContent,
} from 'src/components/shared/Entity/Details/Alerts/types';
import type { AlertNode } from 'src/types/gql';

import { useCallback } from 'react';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import useSettingIntervalOptions from 'src/components/shared/Entity/Details/Overview/NotificationSettings/useSettingIntervalOptions';
import { ALERT_SETTING } from 'src/settings/alerts';

function useAlertTypeContent() {
    const intl = useIntl();

    const { options } = useSettingIntervalOptions();

    return useCallback(
        ({
            alertType,
            alertDetails,
            firedAt,
            resolvedAt,
        }: AlertNode): AlertTypeContent => {
            if (alertType && ALERT_SETTING[alertType]) {
                let detail: AlertDetail | null = null;

                const { detailKey } = ALERT_SETTING[alertType];
                if (detailKey) {
                    let dataVal = alertDetails[detailKey];
                    // This is an older alert so needs special handling.
                    //  Make a "fake" server error
                    if (detailKey === 'evaluation_interval' && dataVal) {
                        const interval = options[dataVal];
                        if (interval) {
                            dataVal = intl.formatMessage(
                                {
                                    id: 'alerts.alertType.details.humanReadable.serverError.evaluation_interval',
                                },
                                {
                                    interval,
                                }
                            );
                        }
                    }

                    detail = {
                        dataVal,
                        key: detailKey,
                        label: intl.formatMessage({
                            id: `alerts.alertType.details.humanReadable.${detailKey}`,
                        }),
                    };
                }

                const response: AlertTypeContent = {
                    detail,
                    docLink: ALERT_SETTING[alertType].docLink,
                    humanReadable: intl.formatMessage({
                        id: ALERT_SETTING[alertType].humanReadableIntlKey,
                    }),
                    recipientList:
                        alertDetails.recipients &&
                        alertDetails.recipients.length > 0
                            ? alertDetails.recipients.map(
                                  (recipient): ChipDisplay => ({
                                      display: recipient.email,
                                      title: recipient.full_name,
                                  })
                              )
                            : [
                                  {
                                      display: intl.formatMessage({
                                          id: 'alerts.table.recipients.empty',
                                      }),
                                      title: intl.formatMessage({
                                          id: 'alerts.table.recipients.empty.tooltip',
                                      }),
                                  },
                              ],
                    firedAtReadable: DateTime.fromISO(firedAt)
                        .toUTC()
                        .toLocaleString(DateTime.DATETIME_FULL),
                    resolvedAtReadable: !resolvedAt
                        ? ''
                        : DateTime.fromISO(resolvedAt)
                              .toUTC()
                              .toLocaleString(DateTime.DATETIME_FULL),
                };

                return response;
            }

            return {
                detail: null,
                humanReadable: '',
                firedAtReadable: '',
                recipientList: [],
                resolvedAtReadable: '',
            };
        },
        [intl, options]
    );
}

export default useAlertTypeContent;
