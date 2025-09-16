import type { AlertCardProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import AlertCardHeader from 'src/components/shared/Entity/Details/Alerts/AlertCardHeader';
import AlertDetailsWrapper from 'src/components/shared/Entity/Details/Alerts/AlertDetails';
import { truncateTextSx } from 'src/context/Theme';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCard({ datum }: AlertCardProps) {
    const intl = useIntl();
    const getAlertTypeContent = useAlertTypeContent();
    const { firedAtReadable } = getAlertTypeContent(datum);

    return (
        <CardWrapper
            message={<AlertCardHeader datum={datum} />}
            sx={{ minWidth: 0, height: '100%' }}
        >
            <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
                <Stack>
                    <Typography>
                        {intl.formatMessage({
                            id: 'alerts.table.data.firedAt',
                        })}
                    </Typography>
                    <Typography sx={truncateTextSx}>
                        {firedAtReadable}
                    </Typography>
                </Stack>

                <AlertDetailsWrapper datum={datum} />
            </Stack>
        </CardWrapper>
    );
}

export default AlertCard;
