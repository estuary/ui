import type { AlertCardHeaderProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { IconButton, Stack, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';

import AlertTypeContent from 'src/components/tables/AlertHistory/AlertTypeContent';

function AlertCardHeader({ alertType }: AlertCardHeaderProps) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography>
                <AlertTypeContent alertType={alertType} />
            </Typography>
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
