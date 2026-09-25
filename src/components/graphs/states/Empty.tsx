import type { ReactNode } from 'react';

import { Stack, Typography } from '@mui/material';

import { CARD_AREA_HEIGHT } from 'src/utils/billing-utils';

interface Props {
    message: string | ReactNode;
    header?: string | ReactNode;
}

function EmptyGraphState({ header, message }: Props) {
    return (
        <Stack
            spacing={1}
            sx={{
                height: CARD_AREA_HEIGHT,
                pt: 7,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="subtitle2" align="center">
                {header ? header : 'No information found.'}
            </Typography>

            <Typography component="div">{message}</Typography>
        </Stack>
    );
}

export default EmptyGraphState;
