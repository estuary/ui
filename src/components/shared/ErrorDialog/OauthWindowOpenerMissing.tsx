import { Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ErrorDialog from 'src/components/shared/ErrorDialog/index';

const ARIA_NAME = 'OauthWindowOpenerMissing';

function OauthWindowOpenerMissing() {
    const intl = useIntl();

    return (
        <ErrorDialog
            body={
                <Stack spacing={2}>
                    <Typography>
                        {intl.formatMessage({
                            id: 'oauth.windowOpener.error.message1',
                        })}
                    </Typography>
                    <Typography>
                        {intl.formatMessage({
                            id: 'oauth.windowOpener.error.message2',
                        })}
                    </Typography>
                </Stack>
            }
            bodyTitle={intl.formatMessage({
                id: 'oauth.windowOpener.error.title',
            })}
            cta={
                <Button
                    onClick={() => {
                        window.close();
                    }}
                >
                    {intl.formatMessage({ id: 'cta.close' })}
                </Button>
            }
            dialogTitle={intl.formatMessage({
                id: 'oauth.windowOpener.error.dialog.title',
            })}
            name={ARIA_NAME}
        />
    );
}

export default OauthWindowOpenerMissing;
