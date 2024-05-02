import { Button, Dialog } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import RefreshTokenContent from './Dialog/Content';
import RefreshTokenTitle from './Dialog/Title';

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

                <RefreshTokenContent />
            </Dialog>
        </>
    );
}

export default ConfigureRefreshTokenButton;
