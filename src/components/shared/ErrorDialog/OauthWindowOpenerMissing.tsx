import { Button, Stack, Typography } from '@mui/material';

import ErrorDialog from 'src/components/shared/ErrorDialog/index';

const ARIA_NAME = 'OauthWindowOpenerMissing';

function OauthWindowOpenerMissing() {
    return (
        <ErrorDialog
            body={
                <Stack spacing={2}>
                    <Typography>
                        We are unable to communicate with the window that opened
                        the OAuth pop up. The window may have been closed.
                    </Typography>
                    <Typography>
                        Please close this dialog and try again.
                    </Typography>
                </Stack>
            }
            bodyTitle={<>Cannot reach parent window</>}
            cta={
                <Button
                    onClick={() => {
                        window.close();
                    }}
                >
                    Close
                </Button>
            }
            dialogTitle={<>OAuth Failed</>}
            name={ARIA_NAME}
        />
    );
}

export default OauthWindowOpenerMissing;
