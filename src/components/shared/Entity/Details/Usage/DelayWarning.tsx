import { Stack, Tooltip, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useSyncScheduleDelayWarning } from 'src/hooks/details/useSyncScheduleDelayWarning';

function DelayWarning() {
    const intl = useIntl();

    const reportingDelayMessage = useSyncScheduleDelayWarning();

    if (!reportingDelayMessage) {
        return null;
    }

    return (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'end' }}>
            <Typography variant="caption">{reportingDelayMessage}</Typography>
            <Tooltip
                title={intl.formatMessage({
                    id: 'detailsPanel.graph.syncDelay.tooltip',
                })}
            >
                <HelpCircle style={{ fontSize: 11 }} />
            </Tooltip>
        </Stack>
    );
}

export default DelayWarning;
