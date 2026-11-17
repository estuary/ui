import type { PostgrestSingleResponse } from '@supabase/postgrest-js';
import type { KeyedMutator } from 'swr';

export interface UserInfoSummary {
    hasSupportAccess: boolean;
    hasAnyAccess: boolean;
}

export interface UserInfoStore extends UserInfoSummary {
    populateAll: (newVal: UserInfoSummary) => void;
    mutate: null | KeyedMutator<PostgrestSingleResponse<UserInfoSummary>>;
    setMutate: (
        newVal: KeyedMutator<PostgrestSingleResponse<UserInfoSummary>>
    ) => void;
}
