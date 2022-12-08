import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import useDiscoverCapture from 'components/capture/useDiscoverCapture';
import {
    glassBkgWithoutBlur,
    secondaryButtonBackground,
    secondaryButtonHoverBackground,
} from 'context/Theme';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Entity } from 'types';

interface Props {
    entityType: Entity;
    disabled: boolean;
    callFailed: Function;
    postGenerateMutate: Function;
}

const TITLE_ID = 'rediscovery-confirmation-dialog-title';

function RediscoverButton({
    entityType,
    disabled,
    callFailed,
    postGenerateMutate,
}: Props) {
    const [open, setOpen] = useState<boolean>(false);

    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        callFailed,
        postGenerateMutate,
        { initiateRediscovery: true }
    );

    const handlers = {
        openConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(true);
        },
        closeConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
    };

    return (
        <>
            <Dialog
                open={open}
                maxWidth="md"
                aria-labelledby={TITLE_ID}
                sx={{
                    '& .MuiPaper-root.MuiDialog-paper': {
                        backgroundColor: (theme) =>
                            glassBkgWithoutBlur[theme.palette.mode],
                        borderRadius: 5,
                    },
                }}
            >
                <DialogTitle id={TITLE_ID}>
                    <FormattedMessage id="workflows.collectionSelector.rediscoverDialog.title" />
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        <FormattedMessage id="workflows.collectionSelector.rediscoverDialog.message1" />
                    </Typography>

                    <Typography>
                        <FormattedMessage id="workflows.collectionSelector.rediscoverDialog.message2" />
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        onClick={handlers.closeConfirmationDialog}
                        sx={{
                            'backgroundColor': (theme) =>
                                secondaryButtonBackground[theme.palette.mode],
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    secondaryButtonHoverBackground[
                                        theme.palette.mode
                                    ],
                            },
                        }}
                    >
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <Button onClick={generateCatalog}>
                        <FormattedMessage id="cta.continue" />
                    </Button>
                </DialogActions>
            </Dialog>

            <Button
                variant="text"
                disabled={disabled || isSaving || formActive}
                onClick={handlers.openConfirmationDialog}
                sx={{ borderRadius: 0 }}
            >
                <FormattedMessage id="workflows.collectionSelector.cta.rediscover" />
            </Button>
        </>
    );
}

export default RediscoverButton;
