import { Stack, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';

import { useSyncScheduleDelayWarning } from 'src/hooks/details/useSyncScheduleDelayWarning';

function DelayWarning() {
    const reportingDelayMessage = useSyncScheduleDelayWarning();

    if (!reportingDelayMessage) {
        return null;
    }

    return (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'end' }}>
            <Typography variant="caption">{reportingDelayMessage}</Typography>
            <Tooltip title="Reporting can be delayed by up to 2x the set update delay in the configuration.">
                <HelpCircle style={{ fontSize: 11 }} />
            </Tooltip>
        </Stack>
    );
}

export default DelayWarning;
