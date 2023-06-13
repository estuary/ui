import { Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { CARD_AREA_HEIGHT } from 'utils/billing-utils';

function EmptyGraphState() {
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
                <FormattedMessage id="admin.billing.table.history.emptyTableDefault.header" />
            </Typography>

            <Typography component="div">
                <FormattedMessage id="admin.billing.table.history.emptyTableDefault.message" />
            </Typography>
        </Stack>
    );
}

export default EmptyGraphState;
