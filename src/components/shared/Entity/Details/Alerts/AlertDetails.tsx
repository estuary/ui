import type { AlertDetailsWrapperProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Stack, Typography } from '@mui/material';

import ServerError from 'src/components/shared/Entity/Details/Alerts/Details/ServerError';
import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertDetailsWrapper({ datum }: AlertDetailsWrapperProps) {
    const getAlertTypeContent = useAlertTypeContent();
    const { detail } = getAlertTypeContent(datum);

    if (!detail) {
        return null;
    }

    return (
        <Stack>
            <Typography>{detail.label}</Typography>
            <ServerError datum={datum} detail={detail} />
        </Stack>
    );
}

export default AlertDetailsWrapper;
