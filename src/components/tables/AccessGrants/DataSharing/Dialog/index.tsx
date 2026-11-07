import type { PostgrestError } from '@supabase/postgrest-js';
import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useSemanticLeaf } from 'react-semantic-tree';

import AlertBox from 'src/components/shared/AlertBox';
import Error from 'src/components/shared/Error';
import GenerateGrant from 'src/components/tables/AccessGrants/DataSharing/Dialog/GenerateGrant';

const TITLE_ID = 'share-data-dialog-title';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function ShareDataDialog({ open, setOpen }: Props) {
    const { ref: semanticCloseRef } =
        useSemanticLeaf<HTMLButtonElement>('Close');

    const theme = useTheme();

    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setServerError(null);
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            aria-labelledby={TITLE_ID}
            onClose={closeDialog}
        >
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">Share Data</Typography>

                <IconButton ref={semanticCloseRef} onClick={closeDialog}>
                    <Xmark
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {serverError ? (
                    <Box sx={{ mb: 3 }}>
                        {serverError.code === '42501' ? (
                            <AlertBox severity="error" short>
                                <Typography>
                                    The value entered in the Shared Prefix text
                                    field is not an extension of an existing
                                    prefix.
                                </Typography>
                            </AlertBox>
                        ) : serverError.code === '23505' ? (
                            <AlertBox severity="error" short>
                                <Typography>
                                    The requested access has already been
                                    provisioned.
                                </Typography>
                            </AlertBox>
                        ) : (
                            <Error
                                error={serverError}
                                condensed={true}
                                hideTitle={true}
                            />
                        )}
                    </Box>
                ) : null}

                <GenerateGrant
                    serverError={serverError}
                    setServerError={setServerError}
                    setOpen={setOpen}
                />
            </DialogContent>
        </Dialog>
    );
}

export default ShareDataDialog;
