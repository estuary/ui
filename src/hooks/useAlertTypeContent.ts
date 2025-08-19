import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { ALERT_SETTING } from 'src/settings/alerts';

function useAlertTypeContent(alertType: any) {
    const intl = useIntl();

    return useMemo(() => {
        if (alertType && ALERT_SETTING[alertType]) {
            return {
                humanReadable: intl.formatMessage({
                    id: ALERT_SETTING[alertType].humanReadableIntlKey,
                }),
                explanation: intl.formatMessage({
                    id: ALERT_SETTING[alertType].explanationIntlKey,
                }),
            };
        }

        return {
            humanReadable: '',
            explanation: '',
        };
    }, [alertType, intl]);
}

export default useAlertTypeContent;
