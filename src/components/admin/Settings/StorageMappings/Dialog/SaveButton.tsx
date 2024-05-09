import { LoadingButton } from '@mui/lab';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import useDirectiveGuard from 'app/guards/hooks';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { useZustandStore } from 'context/Zustand/provider';
import { jobStatusQuery, trackEvent } from 'directives/shared';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import { SelectTableStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';
import useRepublishPrefix from './useRepublishPrefix';

const SELECTED_DIRECTIVE = 'storageMappings';

const submitStorageMapping = async (
    directive: any,
    storageConfig: object,
    prefix: string
) => {
    return submitDirective(
        SELECTED_DIRECTIVE,
        directive,
        storageConfig,
        prefix
    );
};

function SaveButton() {
    const republishPrefix = useRepublishPrefix();

    const { jobStatusPoller } = useJobStatusPoller();
    const { directive, loading } = useDirectiveGuard(SELECTED_DIRECTIVE, {
        forceNew: true,
        hideAlert: true,
    });

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.STORAGE_MAPPINGS,
        selectableTableStoreSelectors.query.hydrate
    );

    const prefix = useTenantStore((state) => state.selectedTenant);

    const formData = useStorageMappingStore((state) => state.formValue.data);
    const formErrors = useStorageMappingStore(
        (state) => state.formValue.errors
    );

    const saving = useStorageMappingStore((state) => state.saving);
    const setSaving = useStorageMappingStore((state) => state.setSaving);

    const setServerError = useStorageMappingStore(
        (state) => state.setServerError
    );
    const provider = useStorageMappingStore((state) => state.provider);

    const storageConfig: object | null = useMemo(
        () => (isEmpty(formData) ? null : { provider, ...formData }),
        [formData, provider]
    );

    const onClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        if (prefix && storageConfig) {
            setServerError(null);
            setSaving(true);

            const response = await submitStorageMapping(
                directive,
                storageConfig,
                prefix
            );

            if (response.error || isEmpty(response.data)) {
                setSaving(false);

                return setServerError(
                    (response.error as PostgrestError).message
                );
            }

            const data = response.data[0];

            jobStatusPoller(
                jobStatusQuery(data),
                async () => {
                    hydrate();

                    await republishPrefix(prefix);
                },
                async (payload: any) => {
                    if (directive) {
                        trackEvent(`${SELECTED_DIRECTIVE}:Error`, directive);
                    }

                    setSaving(false);
                    setServerError(payload.job_status.error);
                }
            );
        }
    };

    return (
        <LoadingButton
            disabled={
                isEmpty(formData) || hasLength(formErrors) || loading || saving
            }
            loading={loading || saving}
            onClick={onClick}
            size="small"
            variant="contained"
        >
            <span>
                <FormattedMessage id="cta.save" />
            </span>
        </LoadingButton>
    );
}

export default SaveButton;
