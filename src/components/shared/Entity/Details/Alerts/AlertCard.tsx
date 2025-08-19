import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import { ALERT_SETTING } from 'src/settings/alerts';

function AlertCard({ datum }: AlertCardProps) {
    const intl = useIntl();

    return (
        <CardWrapper
            key={`active_alerts_${datum.firedAt}`}
            message={<AlertCardHeader alertType={datum.alertType} />}
        >
            <Typography>
                {intl.formatMessage({
                    id: ALERT_SETTING[datum.alertType].explanationIntlKey,
                })}
            </Typography>
            <ul>
                <li>fired: {datum.firedAt}</li>
                <li>resolved: {datum.resolvedAt}</li>
                <li>interval : {datum.alertDetails.evaluation_interval}</li>
            </ul>
        </CardWrapper>
    );
}

export default AlertCard;
