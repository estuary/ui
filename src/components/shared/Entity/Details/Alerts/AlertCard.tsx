import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Box } from '@mui/material';

import { DateTime } from 'luxon';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import AlertDetails from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import KeyValueList from 'src/components/shared/KeyValueList';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const getAlertTypeContent = useAlertTypeContent();
    const { explanation } = getAlertTypeContent(datum);

    return (
        <CardWrapper message={<AlertCardHeader datum={datum} />}>
            <Box sx={{ px: 2, pb: 2 }}>
                <KeyValueList
                    data={[
                        {
                            title: 'Fired At',
                            val: DateTime.fromISO(datum.firedAt)
                                .toUTC()
                                .toLocaleString(DateTime.DATETIME_FULL),
                        },
                        {
                            title: `Explanation`,
                            val: explanation,
                        },
                    ]}
                />

                <AlertDetails datum={datum} />
            </Box>
        </CardWrapper>
    );
}

export default AlertCard;
