import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const { explanation } = useAlertTypeContent(datum.alertType);

    return (
        <CardWrapper
            key={`active_alerts_${datum.firedAt}`}
            message={<AlertCardHeader alertType={datum.alertType} />}
        >
            <Typography>{explanation}</Typography>
            <ul>
                <li>fired: {datum.firedAt}</li>
                <li>resolved: {datum.resolvedAt}</li>
                <li>interval : {datum.alertDetails.evaluation_interval}</li>
            </ul>
        </CardWrapper>
    );
}

export default AlertCard;
