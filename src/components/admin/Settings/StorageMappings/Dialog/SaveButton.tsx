import { LoadingButton } from '@mui/lab';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import { republishPrefix } from 'api/storageMappings';
import useDirectiveGuard from 'app/guards/hooks';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { useZustandStore } from 'context/Zustand/provider';
import { jobStatusQuery, trackEvent } from 'directives/shared';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import { hasLength } from 'utils/misc-utils';

interface Props {
    prefix: string;
    saving: boolean;
    setSaving: Dispatch<SetStateAction<boolean>>;
}

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

function SaveButton({ prefix, saving, setSaving }: Props) {
    const { jobStatusPoller } = useJobStatusPoller();
    const { directive, loading } = useDirectiveGuard(SELECTED_DIRECTIVE, {
        hideAlert: true,
    });

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.STORAGE_MAPPINGS,
        selectableTableStoreSelectors.query.hydrate
    );

    const formData = useStorageMappingStore((state) => state.formValue.data);
    const formErrors = useStorageMappingStore(
        (state) => state.formValue.errors
    );

    const setPubId = useStorageMappingStore((state) => state.setPubId);
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

            if (response.error) {
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

                    republishPrefix(prefix).then(
                        (payload) => {
                            if (payload.error) {
                                setSaving(false);
                                setServerError(payload.error.message);
                            }

                            if (payload.data) {
                                setPubId(payload.data);
                            } else {
                                setSaving(false);
                                setServerError('Publication ID not found');
                            }
                        },
                        (error) => {
                            console.log('ERROR : Republish logs', error);
                            setSaving(false);
                        }
                    );
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
            variant="contained"
            size="small"
            disabled={
                isEmpty(formData) || hasLength(formErrors) || loading || saving
            }
            loading={loading || saving}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </LoadingButton>
    );
}

export default SaveButton;
