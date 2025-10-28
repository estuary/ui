import type { AlertTruncationMessageProps } from 'src/components/tables/AlertHistory/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { MAX_ALERTS_TO_SHOW } from 'src/components/shared/Entity/Details/Alerts/shared';

function AlertTruncationMessage({ alertCount }: AlertTruncationMessageProps) {
    const intl = useIntl();

    if (alertCount >= MAX_ALERTS_TO_SHOW) {
        return (
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography>
                    {intl.formatMessage(
                        { id: 'alerts.overview.listTruncated' },
                        {
                            alertCount,
                            maxCount: MAX_ALERTS_TO_SHOW,
                        }
                    )}
                </Typography>
            </Stack>
        );
    }

    return null;
}

export default AlertTruncationMessage;
