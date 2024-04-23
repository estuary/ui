import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { getPublicationById } from 'api/publications';
import ProviderSelector from 'components/admin/Settings/StorageMappings/Dialog/ProviderSelector';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import Error from 'components/shared/Error';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { JOB_STATUS_COLUMNS, TABLES, supabaseClient } from 'services/supabase';
import StorageMappingForm from './Form';
import RepublicationLogs from './Logs';
import SaveButton from './SaveButton';

interface Props {
    headerId: string;
    open: boolean;
    selectedTenant: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'configure-storage-dialog-title';

function ConfigureStorageDialog({
    headerId,
    open,
    selectedTenant,
    setOpen,
}: Props) {
    const theme = useTheme();
    const { jobStatusPoller } = useJobStatusPoller();

    const pubId = useStorageMappingStore((state) => state.pubId);
    const logToken = useStorageMappingStore((state) => state.logToken);
    const setLogToken = useStorageMappingStore((state) => state.setLogToken);
    const resetState = useStorageMappingStore((state) => state.resetState);
    const serverError = useStorageMappingStore((state) => state.serverError);
    const setServerError = useStorageMappingStore(
        (state) => state.setServerError
    );

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (pubId && !logToken) {
            getPublicationById(pubId).then(
                (response) => {
                    if (response.error || !response.data) {
                        console.log('ERROR : Fetch log token', response);
                    } else {
                        setLogToken(response.data[0].logs_token);

                        jobStatusPoller(
                            supabaseClient
                                .from(TABLES.PUBLICATIONS)
                                .select(JOB_STATUS_COLUMNS)
                                .eq('id', pubId),
                            async () => {
                                setSaving(false);
                                setServerError(null);
                            },
                            async (payload: any) => {
                                console.log(
                                    'ERROR : Polling publication',
                                    payload
                                );
                            }
                        );
                    }
                },
                (error) => {
                    console.log('ERROR : Fetch log token', error);
                }
            );
        }
    }, [jobStatusPoller, logToken, pubId, setLogToken, setServerError]);

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
                <Typography variant="h6">
                    <FormattedMessage id={headerId} />
                </Typography>

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

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage
                        id="storageMappings.dialog.generate.description"
                        values={{ tenant: <b>{selectedTenant}</b> }}
                    />
                </Typography>

                {/* <Box sx={{ pt: 1, mb: 2 }}>
                    <AlertBox severity="info" short>
                        <FormattedMessage
                            id="storageMappings.dialog.generate.alert.keyPrefix"
                            values={{ tenant: <b>{selectedTenant}</b> }}
                        />
                    </AlertBox>
                </Box> */}

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
                <Button
                    disabled={saving}
                    variant="outlined"
                    size="small"
                    onClick={closeDialog}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton
                    prefix={selectedTenant}
                    saving={saving}
                    setSaving={setSaving}
                />
            </DialogActions>
        </Dialog>
    );
}

export default ConfigureStorageDialog;
