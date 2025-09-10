import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';

export interface StoreWithHydration {
    hydrateState: unknown;

    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;

    // TODO (hydration errors) - type with JOURNAL_READ_ERRORS
    hydrationError: string | null;
    setHydrationError: (value: string | null) => void;

    // TODO (store hydration) we need to make store hydration better
    // Used to keep track if the store should be getting hydrated
    active: boolean;
    setActive: (val: boolean) => void;

    networkFailed: boolean;
    setNetworkFailed: (errorMessage: string | null | undefined) => void;
}

export const getInitialHydrationData = (): Pick<
    StoreWithHydration,
    | 'hydrated'
    | 'hydrationError'
    | 'hydrationErrorsExist'
    | 'active'
    | 'networkFailed'
> => ({
    active: false,
    hydrated: false,
    hydrationError: null,
    hydrationErrorsExist: false,
    networkFailed: false,
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

        setHydrationError: (value) => {
            set(
                produce((state: StoreWithHydration) => {
                    state.hydrationError = value && state.active ? value : null;
                }),
                false,
                `${key} Hydration Error Set`
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

        setNetworkFailed: (errorMessage) => {
            set(
                produce((state: StoreWithHydration) => {
                    state.networkFailed = checkErrorMessage(
                        FAILED_TO_FETCH,
                        errorMessage
                    );
                }),
                false,
                `${key} Network Failed Set`
            );
        },
    };
};

export interface AsyncOperationProps {
    fetcher: PostgrestFilterBuilder<any, any, any> | null;
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
