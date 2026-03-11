import type { CombinedError } from 'urql';

import { useCallback, useState } from 'react';

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
import { useIntl } from 'react-intl';

import Error from 'src/components/shared/Error';
import AccessLinksTable from 'src/components/tables/AccessGrants/AccessLinks';
import GenerateInvitation from 'src/components/tables/AccessGrants/AccessLinks/Dialog/GenerateInvitation';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';

interface PrefixInvitationDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TITLE_ID = 'share-prefix-dialog-title';

function PrefixInvitationDialog({
    open,
    setOpen,
}: PrefixInvitationDialogProps) {
    const intl = useIntl();
    const theme = useTheme();

    const objectRoles = useEntitiesStore_capabilities_adminable();
    const defaultPrefix = objectRoles[0] ?? '';

    const [serverError, setServerError] = useState<CombinedError | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreated = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

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
                <Typography variant="h6">
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.header',
                    })}
                </Typography>

                <IconButton onClick={closeDialog}>
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
                        <Error
                            error={serverError}
                            condensed={true}
                            hideTitle={true}
                        />
                    </Box>
                ) : null}

                <GenerateInvitation
                    serverError={serverError}
                    setServerError={setServerError}
                    prefix={defaultPrefix}
                    onCreated={handleCreated}
                />

                <AccessLinksTable
                    catalogPrefix={defaultPrefix}
                    refreshKey={refreshKey}
                />
            </DialogContent>
        </Dialog>
    );
}

export default PrefixInvitationDialog;
