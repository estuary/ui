import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';

function AlertCard({ datum }: AlertCardProps) {
    return (
        <CardWrapper
            key={`active_alerts_${datum.firedAt}`}
            message={<AlertCardHeader alertType={datum.alertType} />}
        >
            <Typography>
                Lorem ipsum description of what is happening for each alert.
                This will be entered soon.
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
