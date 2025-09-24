import type { PostgrestError } from '@supabase/postgrest-js';
import type { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/useConfigurationSchema';
import type { JsonFormsData } from 'src/types';

export interface StorageMappingState {
    dataPlaneName: string;
    formValue: JsonFormsData;
    logToken: string;
    provider: CloudProviderCodes | null;
    pubId: string;
    saving: boolean;
    serverError: PostgrestError | null;
    resetState: () => void;
    setDataPlaneName: (value: StorageMappingState['dataPlaneName']) => void;
    setLogToken: (value: string) => void;
    setPubId: (value: string) => void;
    setSaving: (value: boolean) => void;
    setServerError: (value: PostgrestError | string | null) => void;
    updateFormValue: (value: JsonFormsData) => void;
    updateProvider: (value: CloudProviderCodes) => void;
}
