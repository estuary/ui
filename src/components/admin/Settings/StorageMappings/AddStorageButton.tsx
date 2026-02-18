import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import {
    DialogId,
    openDialogParams,
} from 'src/hooks/searchParams/useDialogParam';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

export function AddStorageButton() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const [, setSearchParams] = useSearchParams();

    return (
        <Button
            variant="outlined"
            disabled={!hasLength(selectedTenant)}
            onClick={() => {
                setSearchParams(
                    openDialogParams(DialogId.CREATE_STORAGE_MAPPING)
                );
            }}
        >
            <FormattedMessage id="storageMappings.configureStorage.label" />
        </Button>
    );
}
