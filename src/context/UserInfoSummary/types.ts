import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { KeyedMutator } from 'swr';

export interface UserInfoSummary {
    hasDemoAccess: boolean;
    hasSupportAccess: boolean;
    hasAnyAccess: boolean;
}

export interface UserInfoStore extends UserInfoSummary {
    populateAll: (newVal: UserInfoSummary) => void;
    mutate: null | KeyedMutator<PostgrestSingleResponse<UserInfoSummary>>;
    setMutate: (
        newVal: KeyedMutator<PostgrestSingleResponse<UserInfoSummary>>
    ) => void;
    setHasDemoAccess: (newVal: boolean) => void;
}
