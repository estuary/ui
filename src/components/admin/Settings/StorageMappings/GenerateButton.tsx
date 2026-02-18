import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import { openDialogParams } from 'src/hooks/searchParams/useDialogParam';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

function StorageMappingsGenerateButton() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [, setSearchParams] = useSearchParams();

    return (
        <Button
            variant="outlined"
            disabled={!hasLength(selectedTenant)}
            onClick={() => {
                setSearchParams(
                    openDialogParams('create-storage-mapping')
                );
            }}
        >
            <FormattedMessage id="storageMappings.configureStorage.label" />
        </Button>
    );
}

export default StorageMappingsGenerateButton;
