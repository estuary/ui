import { ReactNode } from 'react';

import { FormattedMessage } from 'react-intl';

import { Stack, Typography } from '@mui/material';

import { CARD_AREA_HEIGHT } from 'utils/billing-utils';

interface Props {
    message: string | ReactNode;
}

function EmptyGraphState({ message }: Props) {
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
                <FormattedMessage id="graphs.empty.header" />
            </Typography>

            <Typography component="div">{message}</Typography>
        </Stack>
    );
}

export default EmptyGraphState;
