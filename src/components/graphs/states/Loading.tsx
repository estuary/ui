import { FormattedMessage } from 'react-intl';

import { CircularProgress, Stack, Typography } from '@mui/material';

import { CARD_AREA_HEIGHT } from 'utils/billing-utils';

function GraphLoadingState() {
    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                height: CARD_AREA_HEIGHT,
                pt: 7,
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <CircularProgress size="1.5rem" />

            <Typography component="div">
                <FormattedMessage id="common.loading" />
            </Typography>
        </Stack>
    );
}

export default GraphLoadingState;
