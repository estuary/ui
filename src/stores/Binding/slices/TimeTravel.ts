import { JsonFormsCore } from '@jsonforms/core';
import { NamedSet } from 'zustand/middleware';

import produce from 'immer';
import { isEmpty } from 'lodash';

import { checkForErrors } from 'src/stores/utils';
import { Schema } from 'src/types';
import { getSourceOrTarget } from 'src/utils/workflow-utils';

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
    removeFullSourceConfig: (bindingUUID: string) => void;
    updateFullSourceConfig: (
        bindingUUID: string,
        formData: FullSourceJsonForms
    ) => void;

    fullSourceErrorsExist: boolean;
}

export const initializeFullSourceConfig = (
    state: StoreWithTimeTravel,
    binding: Schema,
    bindingUUID: string
) => {
    const scopedBinding = getSourceOrTarget(binding);
    const nameOnly = typeof scopedBinding === 'string';

    if (nameOnly) {
        state.fullSourceConfigs[bindingUUID] = { data: {}, errors: [] };
    } else {
        const { name, ...restOfFullSource } = scopedBinding;

        state.fullSourceConfigs[bindingUUID] = {
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

    removeFullSourceConfig: (bindingUUID) => {
        set(
            produce((state: StoreWithTimeTravel) => {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete state.fullSourceConfigs[bindingUUID];
            }),
            false,
            'Removing full source config of a binding'
        );
    },

    updateFullSourceConfig: (bindingUUID, formData) => {
        set(
            produce((state: StoreWithTimeTravel) => {
                const existingData =
                    state.fullSourceConfigs[bindingUUID]?.data ?? {};

                const fullSource = formData.data;

                state.fullSourceConfigs[bindingUUID] = isEmpty(fullSource)
                    ? formData
                    : {
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
            'Updating full source config of a binding'
        );
    },
});
