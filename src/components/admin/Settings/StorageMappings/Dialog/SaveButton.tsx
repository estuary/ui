import type { PostgrestError } from '@supabase/postgrest-js';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useMemo } from 'react';

import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { submitDirective } from 'src/api/directives';
import useDirectiveGuard from 'src/app/guards/hooks';
import useRepublishPrefix from 'src/components/admin/Settings/StorageMappings/Dialog/useRepublishPrefix';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { useZustandStore } from 'src/context/Zustand/provider';
import { jobStatusQuery, trackEvent } from 'src/directives/shared';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

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
        <SafeLoadingButton
            disabled={
                isEmpty(formData) || hasLength(formErrors) || loading || saving
            }
            loading={loading || saving}
            onClick={onClick}
            size="small"
            variant="contained"
        >
            <FormattedMessage id="cta.save" />
        </SafeLoadingButton>
    );
}

export default SaveButton;
