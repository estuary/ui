import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
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
                setSearchParams((prev) => {
                    prev.set(GlobalSearchParams.SM_DIALOG, 'create');
                    prev.delete(GlobalSearchParams.SM_PREFIX);
                    return prev;
                });
            }}
        >
            <FormattedMessage id="storageMappings.configureStorage.label" />
        </Button>
    );
}

export default StorageMappingsGenerateButton;
