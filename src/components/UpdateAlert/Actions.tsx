import { Button, Divider, Stack, Typography } from '@mui/material';

import { ReloadWindow } from 'iconoir-react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

function Actions() {
    const reloadPage = () => {
        logRocketEvent(CustomEvents.UPDATE_AVAILABLE, {
            reloadClicked: true,
        });
        window.location.reload();
    };

    return (
        <Stack spacing={2} sx={{ maxWidth: 275, p: 2 }}>
            <Typography variant="h6" component="span">
                Dashboard Updated
            </Typography>
            <Typography variant="body1">
                An updated version of the UI was released. Reload this page to
                get the latest changes.
            </Typography>
            <Typography variant="body2">
                Unsaved changes could be lost.
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
                Reload
            </Button>
        </Stack>
    );
}

export default Actions;
