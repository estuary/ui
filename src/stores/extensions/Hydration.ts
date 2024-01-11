import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import produce from 'immer';
import { NamedSet } from 'zustand/middleware';

export interface StoreWithHydration {
    hydrateState: unknown;

    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;

    // TODO (store hydration) we need to make store hydration better
    // Used to keep track if the store should be getting hydrated
    active: boolean;
    setActive: (val: boolean) => void;
}

export const getInitialHydrationData = (): Pick<
    StoreWithHydration,
    'hydrated' | 'hydrationErrorsExist' | 'active'
> => ({
    active: false,
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
                    state.hydrated = value && state.active ? value : false;
                }),
                false,
                `${key} State Hydrated`
            );
        },

        setHydrationErrorsExist: (value) => {
            set(
                produce((state: StoreWithHydration) => {
                    state.hydrationErrorsExist =
                        value && state.active ? value : false;
                }),
                false,
                `${key} Hydration Errors Detected`
            );
        },

        setActive: (val) => {
            set(
                produce((state: StoreWithHydration) => {
                    state.active = val;
                }),
                false,
                `${key} Active Set`
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
    networkFailed: boolean;
}
export const getAsyncDefault = (): AsyncOperationProps => {
    return {
        fetcher: null,
        count: null,
        loading: false,
        response: null,
        error: null,
        networkFailed: false,
    };
};
