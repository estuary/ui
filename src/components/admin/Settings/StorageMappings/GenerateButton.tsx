import { useState } from 'react';

import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { ConfigureStorageWizard } from 'src/components/admin/Settings/StorageMappings/Dialog';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

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

            <ConfigureStorageWizard open={open} setOpen={setOpen} />
        </>
    );
}

export default StorageMappingsGenerateButton;
