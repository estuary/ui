import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import produce from 'immer';
import { NamedSet } from 'zustand/middleware';

export interface StoreWithHydration {
    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;
}

export const getInitialHydrationData = (): Pick<
    StoreWithHydration,
    'hydrated' | 'hydrationErrorsExist'
> => ({
    hydrated: false,
    hydrationErrorsExist: false,
});

export const getStoreWithHydrationSettings = (
    key: string,
    set: NamedSet<StoreWithHydration>
): StoreWithHydration => {
    return {
        ...getInitialHydrationData(),

        setHydrated: (value) => {
            set(
                produce((state: StoreWithHydration) => {
                    state.hydrated = value;
                }),
                false,
                `${key} State Hydrated`
            );
        },

        setHydrationErrorsExist: (value) => {
            set(
                produce((state: StoreWithHydration) => {
                    state.hydrationErrorsExist = value;
                }),
                false,
                `${key} Hydration Errors Detected`
            );
        },
    };
};

export interface AsyncOperationProps {
    fetcher: PostgrestFilterBuilder<any> | null;
    loading: boolean;
    response: any;
    error: any;
    count: number | null;
}
export const getAsyncDefault = (): AsyncOperationProps => {
    return {
        fetcher: null,
        count: null,
        loading: false,
        response: null,
        error: null,
    };
};
