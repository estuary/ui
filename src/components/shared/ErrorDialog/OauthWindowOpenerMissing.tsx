import { Button, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import ErrorDialog from './index';

const ARIA_NAME = 'OauthWindowOpenerMissing';

function OauthWindowOpenerMissing() {
    return (
        <ErrorDialog
            body={
                <Stack spacing={2}>
                    <Typography>
                        <FormattedMessage id="oauth.windowOpener.error.message1" />
                    </Typography>
                    <Typography>
                        <FormattedMessage id="oauth.windowOpener.error.message2" />
                    </Typography>
                </Stack>
            }
            bodyTitle={<FormattedMessage id="oauth.windowOpener.error.title" />}
            cta={
                <Button
                    onClick={() => {
                        window.close();
                    }}
                >
                    <FormattedMessage id="cta.close" />
                </Button>
            }
            dialogTitle={
                <FormattedMessage id="oauth.windowOpener.error.dialog.title" />
            }
            name={ARIA_NAME}
        />
    );
}

export default OauthWindowOpenerMissing;
