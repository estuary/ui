import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import { Box, Button, Dialog, DialogContent } from '@mui/material';

import { Expand } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { BUTTON_TRANSITION_TIME } from 'src/components/shared/Entity/Details/Alerts/Details/shared';

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
                sx={{
                    [`&:hover, &:focus`]: {
                        opacity: 1,
                        transition: BUTTON_TRANSITION_TIME,
                    },
                    display: 'flex',
                    height: 25,
                    minWidth: 'fit-content',
                    opacity: 0,
                    p: 0.25,
                    transition: BUTTON_TRANSITION_TIME,
                    width: 25,
                }}
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
