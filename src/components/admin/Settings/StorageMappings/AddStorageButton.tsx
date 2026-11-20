import { Button } from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

import { useDialog } from 'src/hooks/useDialog';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

export function AddStorageButton() {
    const { ref: semanticAddStorageRef } = useLeaf('Add Storage');

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { onOpen } = useDialog('CREATE_STORAGE_MAPPING');

    return (
        <Button
            ref={semanticAddStorageRef}
            variant="outlined"
            disabled={!hasLength(selectedTenant)}
            onClick={() => onOpen()}
        >
            Add Storage
        </Button>
    );
}
