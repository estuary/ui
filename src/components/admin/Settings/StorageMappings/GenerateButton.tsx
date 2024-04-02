import { Button } from '@mui/material';
import { useSelectedTenant } from 'context/fetcher/Tenant';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import ConfigureStorageDialog from './Dialog';

function StorageMappingsGenerateButton() {
    const { selectedTenant } = useSelectedTenant();

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
