import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import AlertDetails from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const { explanation } = useAlertTypeContent(datum);

    return (
        <CardWrapper
            key={`active_alerts_${datum.firedAt}`}
            message={<AlertCardHeader datum={datum} />}
        >
            <Typography>{explanation}</Typography>
            <ul>
                <li>fired: {datum.firedAt}</li>
            </ul>

            <AlertDetails datum={datum} />
        </CardWrapper>
    );
}

export default AlertCard;
