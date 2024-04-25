import { Button } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength } from 'utils/misc-utils';
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
                <FormattedMessage id="storageMappings.cta.addStorageMapping" />
            </Button>

            <ConfigureStorageDialog
                headerId="storageMappings.dialog.generate.header"
                open={open}
                selectedTenant={selectedTenant}
                setOpen={setOpen}
            />
        </>
    );
}

export default StorageMappingsGenerateButton;
