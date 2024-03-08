import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { checkForErrors } from 'stores/utils';
import { Schema } from 'types';
import { getSourceOrTarget } from 'utils/workflow-utils';
import { NamedSet } from 'zustand/middleware';

export interface FullSource {
    name?: string;
    notAfter?: string | null; // controlled by the NotDateTime
    notBefore?: string | null; // controlled by the NotDateTime
    partitions?: any; // not set in the UI today
}

export interface FullSourceJsonForms
    extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: FullSource;
}

export interface FullSourceDictionary {
    [k: string]: FullSourceJsonForms | undefined | null;
}

export interface StoreWithTimeTravel {
    fullSourceConfigs: FullSourceDictionary;
    removeFullSourceConfig: (collection: string) => void;
    updateFullSourceConfig: (
        collection: string,
        formData: FullSourceJsonForms
    ) => void;

    fullSourceErrorsExist: boolean;
}

export const initializeFullSourceConfig = (
    state: StoreWithTimeTravel,
    binding: Schema
) => {
    const scopedBinding = getSourceOrTarget(binding);
    const nameOnly = typeof scopedBinding === 'string';

    if (nameOnly) {
        state.fullSourceConfigs[scopedBinding] = { data: {}, errors: [] };
    } else {
        const { name, ...restOfFullSource } = scopedBinding;

        state.fullSourceConfigs[name] = {
            data: restOfFullSource,
            errors: [],
        };
    }
};

export const getInitialTimeTravelData = (): Pick<
    StoreWithTimeTravel,
    'fullSourceConfigs' | 'fullSourceErrorsExist'
> => ({
    fullSourceConfigs: {},
    fullSourceErrorsExist: false,
});

export const getStoreWithTimeTravelSettings = (
    set: NamedSet<StoreWithTimeTravel>
): StoreWithTimeTravel => ({
    ...getInitialTimeTravelData(),

    removeFullSourceConfig: (collection) => {
        set(
            produce((state: StoreWithTimeTravel) => {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete state.fullSourceConfigs[collection];
            }),
            false,
            'Removing full source config of a collection'
        );
    },

    updateFullSourceConfig: (collection, formData) => {
        set(
            produce((state: StoreWithTimeTravel) => {
                const existingData =
                    state.fullSourceConfigs[collection]?.data ?? {};
                const fullSource = formData.data;

                state.fullSourceConfigs[collection] = {
                    data: {
                        ...existingData,
                        ...fullSource,
                    },
                    errors: formData.errors,
                };

                state.fullSourceErrorsExist = checkForErrors(formData)
                    ? true
                    : Object.values(state.fullSourceConfigs).some(
                          (fullSourceConfig) => checkForErrors(fullSourceConfig)
                      );
            }),
            false,
            'Updating full source config of a collection'
        );
    },
});
