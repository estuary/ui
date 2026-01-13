import { Box, DialogContent, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import RepublicationError from 'src/components/admin/Settings/StorageMappings/Dialog/Error';
import { StorageMappingForm } from 'src/components/admin/Settings/StorageMappings/Dialog/Form';
import RepublicationLogs from 'src/components/admin/Settings/StorageMappings/Dialog/Logs';
import { REPUBLICATION_FAILURE_MESSAGE_ID } from 'src/components/admin/Settings/StorageMappings/Dialog/useRepublishPrefix';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import Error from 'src/components/shared/Error';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useTenantStore } from 'src/stores/Tenant/Store';

function StorageMappingContent() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const logToken = useStorageMappingStore((state) => state.logToken);
    const serverError = useStorageMappingStore((state) => state.serverError);

    return (
        <DialogContent sx={{ mt: 1 }}>
            <Box sx={{ mb: 2 }}>
                {serverError?.message === REPUBLICATION_FAILURE_MESSAGE_ID ? (
                    <RepublicationError error={serverError} />
                ) : serverError ? (
                    <Error severity="error" error={serverError} condensed />
                ) : null}
            </Box>

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
                <ErrorBoundryWrapper>
                    <StorageMappingForm />
                </ErrorBoundryWrapper>
            )}
        </DialogContent>
    );
}

export default StorageMappingContent;
