import type { FooDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import { Box, Button, Dialog, DialogContent, Paper } from '@mui/material';

import { Expand } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { zIndexIncrement } from 'src/context/Theme';

function ServerError({ datum, details }: FooDetailsProps) {
    const intl = useIntl();

    const { dataVal } = details[0];

    const [open, setOpen] = useState(false);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(false);
    };

    const detailsDialogId = `alert-details-${datum.firedAt}_${datum.alertType}`;

    const dataValIsLong = dataVal.length > 250;
    const shortDataVal = dataValIsLong
        ? `${dataVal.substring(0, 250)}...`
        : dataVal;

    return (
        <>
            <Paper
                sx={{
                    height: 100,
                    maxHeight: 100,
                    [`& > button`]: {
                        bottom: 20,
                        height: 25,
                        minWidth: 'fit-content',
                        opacity: 0.65,
                        p: 0.25,
                        position: 'absolute',
                        right: 15,
                        width: 25,
                        zIndex: zIndexIncrement + zIndexIncrement,
                    },
                    [`& > section`]: {
                        width: '100%',
                        position: 'absolute',
                        zIndex: zIndexIncrement,
                    },
                }}
            >
                <ServerErrorDetail val={shortDataVal} />
                {dataValIsLong ? (
                    <Button
                        onClick={() => setOpen(true)}
                        variant="contained"
                        color="secondary"
                    >
                        <Expand />
                    </Button>
                ) : null}
            </Paper>
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
                            height: '75vh',
                            width: '100%',
                            [`& .something`]: {
                                flewGrow: 1,
                            },
                        }}
                    >
                        <ServerErrorDetail val={dataVal} />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ServerError;
