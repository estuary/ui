import type { ServerErrorDialogProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import { Box, Button, Dialog, DialogContent, useTheme } from '@mui/material';

import { Expand } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { defaultOutline } from 'src/context/Theme';

function ServerErrorDialog({
    datum,
    detail: { dataVal },
}: ServerErrorDialogProps) {
    const intl = useIntl();
    const theme = useTheme();

    const [open, setOpen] = useState(false);

    const closeDialog = () => {
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
                sx={{
                    height: 25,
                    minWidth: 'fit-content',
                    p: 0.25,
                    width: 25,
                }}
            >
                <Expand />
            </Button>
            <Dialog open={open} fullWidth maxWidth="lg" onClose={closeDialog}>
                <DialogTitleWithClose
                    id={`alert-details-${datum.firedAt}_${datum.alertType}`}
                    onClose={closeDialog}
                >
                    {intl.formatMessage({ id: 'alerts.details.title' })}
                </DialogTitleWithClose>

                <DialogContent>
                    <Box
                        sx={{
                            border: defaultOutline[theme.palette.mode],
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
