import { Box, DialogContent, Typography } from '@mui/material';
import StorageMappingForm from 'components/admin/Settings/StorageMappings/Dialog/Form';
import RepublicationLogs from 'components/admin/Settings/StorageMappings/Dialog/Logs';
import ProviderSelector from 'components/admin/Settings/StorageMappings/Dialog/ProviderSelector';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { FormattedMessage } from 'react-intl';
import { useTenantStore } from 'stores/Tenant/Store';

function StorageMappingContent() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const logToken = useStorageMappingStore((state) => state.logToken);
    const provider = useStorageMappingStore((state) => state.provider);
    const serverError = useStorageMappingStore((state) => state.serverError);

    return (
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
                    token={logToken}
                />
            ) : (
                <>
                    <ProviderSelector />

                    {provider ? (
                        <ErrorBoundryWrapper>
                            <StorageMappingForm />
                        </ErrorBoundryWrapper>
                    ) : null}
                </>
            )}
        </DialogContent>
    );
}

export default StorageMappingContent;
