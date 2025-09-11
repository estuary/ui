import type { FooDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Paper,
    useTheme,
} from '@mui/material';

import { Expand } from 'iconoir-react';
import { useIntl } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { defaultOutline, zIndexIncrement } from 'src/context/Theme';

const maxLengthDetail = 350;

function ServerError({ datum, details }: FooDetailsProps) {
    const intl = useIntl();
    const theme = useTheme();

    const { dataVal } = details[0];

    const [open, setOpen] = useState(false);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(false);
    };

    const detailsDialogId = `alert-details-${datum.firedAt}_${datum.alertType}`;

    const dataValIsLong = dataVal.length > maxLengthDetail;
    const shortDataVal = dataValIsLong
        ? `${dataVal.substring(0, maxLengthDetail)}...`
        : dataVal;

    return (
        <>
            <Paper
                sx={{
                    border: defaultOutline[theme.palette.mode],
                    height: 150,
                    maxHeight: 150,
                    [`&:hover > button,  &:focus > button`]: {
                        opacity: 0.5,
                        transition: `750ms`,
                    },
                    [`& > button`]: {
                        [`&:hover, &:focus`]: {
                            opacity: 1,
                            transition: `750ms`,
                        },
                        bottom: 10,
                        height: 25,
                        minWidth: 'fit-content',
                        opacity: 0,
                        transition: `750ms`,
                        p: 0.25,
                        position: 'absolute',
                        right: 0,
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
                <ServerErrorDetail
                    options={{
                        renderLineHighlight: 'none',
                    }}
                    val={shortDataVal}
                />
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

export default ServerError;
