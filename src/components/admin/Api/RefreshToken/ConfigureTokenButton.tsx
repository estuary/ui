import { useState } from 'react';

import { Button, Dialog, DialogContent, Grid } from '@mui/material';

import RefreshTokenDescription from './Dialog/Description';
import RefreshTokenError from './Dialog/Error';
import GenerateButton from './Dialog/GenerateButton';
import RefreshTokenTitle from './Dialog/Title';
import CopyRefreshToken from './Dialog/Token';
import { FormattedMessage } from 'react-intl';

const TITLE_ID = 'create-refresh-tokens-title';

function ConfigureRefreshTokenButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => {
                    setOpen(true);
                }}
                variant="outlined"
            >
                <FormattedMessage id="admin.cli_api.refreshToken.cta.generate" />
            </Button>

            <Dialog
                open={open}
                maxWidth="md"
                fullWidth
                aria-labelledby={TITLE_ID}
            >
                <RefreshTokenTitle setOpen={setOpen} />

                <DialogContent>
                    <Grid
                        container
                        spacing={3}
                        sx={{ mb: 1, alignItems: 'flex-start' }}
                    >
                        <RefreshTokenError />

                        <CopyRefreshToken />

                        <Grid item xs={9} sx={{ mt: 1, display: 'flex' }}>
                            <RefreshTokenDescription />
                        </Grid>

                        <Grid item xs={3} sx={{ mt: 1, display: 'flex' }}>
                            <GenerateButton />
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ConfigureRefreshTokenButton;
