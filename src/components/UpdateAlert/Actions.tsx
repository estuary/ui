import { Button, Divider, Stack, Typography } from '@mui/material';

import { ReloadWindow } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

function Actions() {
    const intl = useIntl();

    const reloadPage = () => {
        logRocketEvent(CustomEvents.UPDATE_AVAILABLE, {
            reloadClicked: true,
        });
        window.location.reload();
    };

    return (
        <Stack spacing={2} sx={{ maxWidth: 275 }}>
            <Typography variant="h6" component="span">
                {intl.formatMessage({ id: 'updateAlert.title' })}
            </Typography>
            <Typography variant="body1">
                {intl.formatMessage({ id: 'updateAlert.message' })}
            </Typography>
            <Typography variant="body2">
                {intl.formatMessage({ id: 'updateAlert.warning' })}
            </Typography>
            <Divider />
            <Button
                onClick={reloadPage}
                endIcon={<ReloadWindow style={{ fontSize: 12 }} />}
                style={{
                    alignSelf: 'self-end',
                    maxWidth: 'fit-content',
                }}
            >
                {intl.formatMessage({ id: 'cta.reload' })}
            </Button>
        </Stack>
    );
}

export default Actions;
