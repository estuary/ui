import type { EndpointConfigState } from 'src/stores/EndpointConfig/types';
import type { CustomError } from 'src/stores/extensions/CustomErrors';
import type { JsonFormsData } from 'src/types';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isEmpty } from 'lodash';

import { createJSONFormDefaults } from 'src/services/ajv';
import { getDereffedSchema } from 'src/services/jsonforms';
import {
    fetchErrors,
    filterErrors,
    getInitialCustomErrorsData,
    getStoreWithCustomErrorsSettings,
} from 'src/stores/extensions/CustomErrors';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { configCanBeEmpty, hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

const STORE_KEY = 'Endpoint Config';

const populateErrors = (
    endpointConfig: JsonFormsData,
    customErrors: CustomError[],
    state: EndpointConfigState
): void => {
    const endpointConfigErrors = filterErrors(fetchErrors(endpointConfig));

    state.endpointConfigErrors = endpointConfigErrors.map((message) => ({
        message,
    }));

    state.errorsExist = !state.serverUpdateRequired
        ? false
        : !isEmpty(endpointConfigErrors) || !isEmpty(customErrors);
};

const getInitialStateData = (): Pick<
    EndpointConfigState,
    | 'encryptedEndpointConfig'
    | 'endpointCanBeEmpty'
    | 'endpointConfig'
    | 'errorsExist'
    | 'endpointConfigErrors'
    | 'endpointSchema'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'previousEndpointConfig'
    | 'publishedEndpointConfig'
    | 'serverUpdateRequired'
> => ({
    encryptedEndpointConfig: { data: {}, errors: [] },
    endpointCanBeEmpty: false,
    endpointConfig: { data: {}, errors: [] },
    errorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
    hydrated: false,
    hydrationErrorsExist: false,
    previousEndpointConfig: { data: {}, errors: [] },
    publishedEndpointConfig: { data: {}, errors: [] },
    serverUpdateRequired: false,
});

const getInitialState = (
    set: NamedSet<EndpointConfigState>,
    get: StoreApi<EndpointConfigState>['getState']
): EndpointConfigState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getStoreWithCustomErrorsSettings(STORE_KEY),

    setCustomErrors: (val) => {
        set(
            produce((state: EndpointConfigState) => {
                state.customErrors = val;
                state.customErrorsExist = hasLength(val);

                // Setting this so that if there is a custom error then the
                //  generate button will not proceed
                populateErrors(state.endpointConfig, val, state);
            }),
            false,
            'Endpoint Custom Errors Set'
        );
    },

    setEndpointSchema: async (val) => {
        const resolved = await getDereffedSchema(val);
        set(
            produce((state: EndpointConfigState) => {
                if (!resolved) {
                    state.setHydrationErrorsExist(true);
                    return;
                }
                state.endpointSchema = resolved;
                state.endpointCanBeEmpty = configCanBeEmpty(resolved);

                populateErrors(state.endpointConfig, state.customErrors, state);
            }),
            false,
            'Endpoint Schema Set'
        );
    },

    setPublishedEndpointConfig: (encryptedEndpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                state.publishedEndpointConfig = isEmpty(encryptedEndpointConfig)
                    ? createJSONFormDefaults(state.endpointSchema)
                    : encryptedEndpointConfig;
            }),
            false,
            'Published Endpoint Config Set'
        );
    },

    setEncryptedEndpointConfig: (encryptedEndpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                state.encryptedEndpointConfig = isEmpty(encryptedEndpointConfig)
                    ? createJSONFormDefaults(state.endpointSchema)
                    : encryptedEndpointConfig;

                // TODO (endpoint config)
                // I have NO clue why this is passing the encryptedConfig that is becing passed in and
                //  not what is set to the state. Especially since it could end up with setting defaults to
                //  the state value
                populateErrors(
                    encryptedEndpointConfig,
                    state.customErrors,
                    state
                );
            }),
            false,
            'Encrypted Endpoint Config Set'
        );
    },

    setPreviousEndpointConfig: (endpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                state.previousEndpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(state.endpointSchema)
                    : endpointConfig;
            }),
            false,
            'Previous Endpoint Config Changed'
        );
    },

    setEndpointConfig: (endpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                state.endpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(state.endpointSchema)
                    : endpointConfig;

                populateErrors(state.endpointConfig, state.customErrors, state);
            }),
            false,
            'Endpoint Config Changed'
        );
    },

    setServerUpdateRequired: (updateRequired) => {
        set(
            produce((state: EndpointConfigState) => {
                state.serverUpdateRequired = state.endpointCanBeEmpty
                    ? false
                    : updateRequired;

                populateErrors(state.endpointConfig, state.customErrors, state);
            }),
            false,
            'Server Update Required Flag Changed'
        );
    },

    setEndpointCanBeEmpty: (endpointCanBeEmpty) => {
        set(
            produce((state: EndpointConfigState) => {
                state.endpointCanBeEmpty = endpointCanBeEmpty;
            }),
            false,
            'Endpoint Can Be Empty Changed'
        );
    },

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
                ...getInitialHydrationData(),
                ...getInitialCustomErrorsData(),
            },
            false,
            'Endpoint Config State Reset'
        );
    },
});

export const useEndpointConfigStore = create<EndpointConfigState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('general-endpoint-config')
    )
);
