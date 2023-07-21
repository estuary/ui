import produce from 'immer';

import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

import { NamedSet } from 'zustand/middleware';

export interface StoreWithHydration {
    hydrateState: unknown;

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

        hydrateState: () => {
            console.error(`${key} : missing implementation of : hydrateState`);
        },

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
