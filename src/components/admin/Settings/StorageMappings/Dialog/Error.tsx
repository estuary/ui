import { AlertTitle, Button, Stack, Typography } from '@mui/material';

import { PostgrestError } from '@supabase/postgrest-js';
import { FormattedMessage } from 'react-intl';

import useRepublishPrefix from 'src/components/admin/Settings/StorageMappings/Dialog/useRepublishPrefix';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import AlertBox from 'src/components/shared/AlertBox';
import { useTenantStore } from 'src/stores/Tenant/Store';

interface Props {
    error: PostgrestError;
}

function RepublicationError({ error }: Props) {
    const republishPrefix = useRepublishPrefix();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const saving = useStorageMappingStore((state) => state.saving);
    const setSaving = useStorageMappingStore((state) => state.setSaving);
    const setServerError = useStorageMappingStore(
        (state) => state.setServerError
    );

    const retryPublication = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setServerError(null);
        setSaving(true);

        await republishPrefix(selectedTenant);
    };

    return (
        <AlertBox
            severity="error"
            short
            title={
                <AlertTitle>
                    <FormattedMessage id="error.title" />
                </AlertTitle>
            }
        >
            <Stack spacing={1}>
                <Typography>
                    <FormattedMessage id={error.message} />
                </Typography>

                <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                    <Button
                        disabled={saving}
                        onClick={retryPublication}
                        size="small"
                    >
                        <FormattedMessage id="cta.restart" />
                    </Button>
                </Stack>
            </Stack>
        </AlertBox>
    );
}

export default RepublicationError;
