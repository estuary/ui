import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useDialog } from 'src/hooks/useDialog';
import { useTenantStore } from 'src/stores/Tenant/Store';
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
            <FormattedMessage id="storageMappings.configureStorage.label" />
        </Button>
    );
}
