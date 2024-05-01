import { Button } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import CreateRefreshTokenDialog from './Dialog';

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

            <CreateRefreshTokenDialog open={open} setOpen={setOpen} />
        </>
    );
}

export default ConfigureRefreshTokenButton;
