import { PostgrestError } from '@supabase/postgrest-js';
import { CloudProviderCodes } from 'components/admin/Settings/StorageMappings/Dialog/useConfigurationSchema';
import { JsonFormsData } from 'types';

export interface StorageMappingState {
    provider: CloudProviderCodes | null;
    updateProvider: (value: CloudProviderCodes) => void;

    formValue: JsonFormsData;
    updateFormValue: (value: JsonFormsData) => void;

    pubId: string;
    setPubId: (value: string) => void;

    logToken: string;
    setLogToken: (value: string) => void;

    saving: boolean;
    setSaving: (value: boolean) => void;

    serverError: PostgrestError | null;
    setServerError: (value: PostgrestError | string | null) => void;

    resetState: () => void;
}
