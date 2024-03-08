import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { checkForErrors } from 'stores/utils';
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

    initializeFullSourceConfigs: (val: any[] | null) => void;
    fullSourceErrorsExist: boolean;
}

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

    initializeFullSourceConfigs: (bindings) => {
        set(
            produce((state: StoreWithTimeTravel) => {
                const newConfig = {};

                if (bindings && bindings.length > 0) {
                    bindings.forEach((binding) => {
                        const bindingSource = getSourceOrTarget(binding);
                        const nameOnly = typeof bindingSource === 'string';

                        if (nameOnly) {
                            newConfig[bindingSource] = {};
                        } else {
                            const { name, ...restOfFullSource } = bindingSource;
                            newConfig[name] = {
                                data: restOfFullSource,
                                errors: [],
                            };
                        }
                    });
                }

                state.fullSourceConfigs = newConfig;
            }),
            false,
            'Prefilling full source configs'
        );
    },

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
