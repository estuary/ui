import { Button } from '@mui/material';

import { useDialog } from 'src/hooks/useDialog';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

export function AddStorageButton() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { onOpen } = useDialog('CREATE_STORAGE_MAPPING');

    return (
        <Button
            variant="outlined"
            disabled={!hasLength(selectedTenant)}
            onClick={() => onOpen()}
        >
            Add Storage
        </Button>
    );
}
