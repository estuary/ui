import type { AlertCardHeaderProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { IconButton, Stack, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';

import useAlertTypeContent from 'src/hooks/useAlertTypeContent';

function AlertCardHeader({ alertType }: AlertCardHeaderProps) {
    const { humanReadable } = useAlertTypeContent(alertType);

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography>{humanReadable}</Typography>
            <IconButton
                sx={{
                    p: 0,
                }}
            >
                <HelpCircle />
            </IconButton>
        </Stack>
    );
}

export default AlertCardHeader;
