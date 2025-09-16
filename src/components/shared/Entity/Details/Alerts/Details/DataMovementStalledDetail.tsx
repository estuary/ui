import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { Stack, Typography } from '@mui/material';

import ServerError from 'src/components/shared/Entity/Details/Alerts/Details/ServerError';

function DataMovementStalledDetail(props: AlertDetailsProps) {
    const { details } = props;

    return (
        <Stack>
            <Typography>{details[0].label}</Typography>
            <ServerError {...props} />
        </Stack>
    );
}

export default DataMovementStalledDetail;
