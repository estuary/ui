import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import { Box, Button, Dialog, DialogContent } from '@mui/material';

import { Expand } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

function ServerErrorDialog({ datum, details }: AlertDetailsProps) {
    const detailsDialogId = `alert-details-${datum.firedAt}_${datum.alertType}`;
    const { dataVal } = details[0];

    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(false);
    };

    // Just being safe on the rare case we do not get the data we're expecting
    if (!dataVal) {
        return null;
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="contained"
                color="secondary"
            >
                <Expand />
            </Button>
            <Dialog open={open} fullWidth maxWidth="lg" onClose={closeDialog}>
                <DialogTitleWithClose
                    id={detailsDialogId}
                    onClose={() => setOpen(false)}
                >
                    {intl.formatMessage({ id: 'alerts.details.title' })}
                </DialogTitleWithClose>

                <DialogContent>
                    <Box
                        sx={{
                            height: '65vh',
                            width: '100%',
                        }}
                    >
                        <ServerErrorDetail val={dataVal} />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ServerErrorDialog;
