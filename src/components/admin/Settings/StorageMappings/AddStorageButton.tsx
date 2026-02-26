import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useDialog } from 'src/hooks/useDialog';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

export function AddStorageButton() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { onOpen } = useDialog('CREATE_STORAGE_MAPPING');
    const intl = useIntl();

    return (
        <Button
            variant="outlined"
            disabled={!hasLength(selectedTenant)}
            onClick={() => onOpen()}
        >
            {intl.formatMessage({
                id: 'storageMappings.configureStorage.label',
            })}
        </Button>
    );
}
