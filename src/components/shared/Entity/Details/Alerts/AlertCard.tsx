import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Box } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import AlertDetails from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import KeyValueList from 'src/components/shared/KeyValueList';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const getAlertTypeContent = useAlertTypeContent();
    const { firedAtReadable } = getAlertTypeContent(datum);

    return (
        <CardWrapper message={<AlertCardHeader datum={datum} />}>
            <Box sx={{ px: 2, pb: 2 }}>
                <KeyValueList
                    data={[
                        {
                            title: 'Fired At',
                            val: firedAtReadable,
                        },
                    ]}
                />

                <AlertDetails datum={datum} />
            </Box>
        </CardWrapper>
    );
}

export default AlertCard;
