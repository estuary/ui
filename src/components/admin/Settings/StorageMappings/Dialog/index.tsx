import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import StorageMappingForm from 'components/admin/Settings/StorageMappings/Dialog/Form';
import RepublicationLogs from 'components/admin/Settings/StorageMappings/Dialog/Logs';
import ProviderSelector from 'components/admin/Settings/StorageMappings/Dialog/ProviderSelector';
import SaveButton from 'components/admin/Settings/StorageMappings/Dialog/SaveButton';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import Error from 'components/shared/Error';
import ExternalLink from 'components/shared/ExternalLink';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    headerId: string;
    open: boolean;
    selectedTenant: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'configure-storage-dialog-title';

const docsUrl =
    'https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow';

function ConfigureStorageDialog({
    headerId,
    open,
    selectedTenant,
    setOpen,
}: Props) {
    const theme = useTheme();

    const logToken = useStorageMappingStore((state) => state.logToken);
    const resetState = useStorageMappingStore((state) => state.resetState);
    const serverError = useStorageMappingStore((state) => state.serverError);
    const saving = useStorageMappingStore((state) => state.saving);
    const setSaving = useStorageMappingStore((state) => state.setSaving);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
        resetState();
        setSaving(false);
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack direction="row" spacing={1}>
                    <Typography variant="h6">
                        <FormattedMessage id={headerId} />
                    </Typography>

                    <ExternalLink link={docsUrl}>
                        <FormattedMessage id="terms.documentation" />
                    </ExternalLink>
                </Stack>

                <IconButton disabled={saving} onClick={closeDialog}>
                    <Cancel
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                {serverError ? (
                    <Box sx={{ mb: 2 }}>
                        <Error severity="error" error={serverError} condensed />
                    </Box>
                ) : null}

                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage
                        id="storageMappings.dialog.generate.description"
                        values={{ tenant: <b>{selectedTenant}</b> }}
                    />
                </Typography>

                {logToken ? (
                    <RepublicationLogs
                        errored={serverError !== null}
                        saving={saving}
                        token={logToken}
                    />
                ) : (
                    <>
                        <ProviderSelector />

                        <StorageMappingForm />
                    </>
                )}
            </DialogContent>

            <DialogActions>
                {logToken ? (
                    <Button
                        disabled={saving}
                        size="small"
                        onClick={closeDialog}
                    >
                        <FormattedMessage id="cta.close" />
                    </Button>
                ) : (
                    <>
                        <Button
                            disabled={saving}
                            variant="outlined"
                            size="small"
                            onClick={closeDialog}
                        >
                            <FormattedMessage id="cta.cancel" />
                        </Button>

                        <SaveButton prefix={selectedTenant} />
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default ConfigureStorageDialog;
