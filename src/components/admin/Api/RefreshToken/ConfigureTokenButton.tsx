import { useState } from 'react';

import { Button, Dialog, DialogContent, Grid } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import RefreshTokenDescription from 'src/components/admin/Api/RefreshToken/Dialog/Description';
import RefreshTokenError from 'src/components/admin/Api/RefreshToken/Dialog/Error';
import GenerateButton from 'src/components/admin/Api/RefreshToken/Dialog/GenerateButton';
import RefreshTokenTitle from 'src/components/admin/Api/RefreshToken/Dialog/Title';
import CopyRefreshToken from 'src/components/admin/Api/RefreshToken/Dialog/Token';

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

                        <Grid size={{ xs: 9 }} sx={{ mt: 1, display: 'flex' }}>
                            <RefreshTokenDescription />
                        </Grid>

                        <Grid size={{ xs: 3 }} sx={{ mt: 1, display: 'flex' }}>
                            <GenerateButton />
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ConfigureRefreshTokenButton;
