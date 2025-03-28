import { Button } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';
import ConfigureStorageDialog from './Dialog';

function StorageMappingsGenerateButton() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="outlined"
                disabled={!hasLength(selectedTenant)}
                onClick={() => {
                    setOpen(true);
                }}
            >
                <FormattedMessage id="storageMappings.configureStorage.label" />
            </Button>

            <ConfigureStorageDialog open={open} setOpen={setOpen} />
        </>
    );
}

export default StorageMappingsGenerateButton;
