import type { EndpointConfigState } from 'src/stores/EndpointConfig/types';
import type { CustomError } from 'src/stores/extensions/CustomErrors';
import type { JsonFormsData } from 'src/types';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import {
    get as getAt,
    isEmpty,
    isEqual,
    isPlainObject,
    pick,
    set as setAt,
} from 'lodash';

import { createJSONFormDefaults } from 'src/services/ajv';
import { getDereffedSchema } from 'src/services/jsonforms';
import { logRocketEvent } from 'src/services/shared';
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
import { isAtOrUnder, toPath } from 'src/utils/schema-utils';
import { getActiveSecretNames, toSecretNames } from 'src/utils/secrets-utils';
import { isEncryptedConfig } from 'src/utils/sops-utils';
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
    | 'savedEndpointConfig'
    | 'serverUpdateRequired'
    | 'activeSecretNames'
    | 'savedSecretNames'
    | 'secretNames'
    | 'selectedOptions'
    | 'sopsPinned'
> => ({
    encryptedEndpointConfig: { data: {}, errors: [] },
    endpointCanBeEmpty: false,
    endpointConfig: { data: {}, errors: [] },
    errorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
    hydrated: false,
    hydrationErrorsExist: false,
    previousEndpointConfig: {},
    publishedEndpointConfig: { data: {}, errors: [] },
    savedEndpointConfig: { data: {}, errors: [] },
    serverUpdateRequired: false,
    activeSecretNames: {},
    savedSecretNames: {},
    secretNames: {},
    selectedOptions: {},
    sopsPinned: false,
});

type Fields = Record<string, unknown>;

const asFields = (value: unknown): Fields =>
    isPlainObject(value) ? (value as Fields) : {};

// Every field the edit set takes its new value, and every field it removed is
// forgotten. The rest keep what they last had.
const remember = (
    memory: unknown,
    before: unknown,
    after: unknown
): unknown => {
    if (!isPlainObject(after)) {
        return after;
    }

    const prior = asFields(before);
    const edited = asFields(after);
    const next = { ...asFields(memory) };

    Object.keys(prior).forEach((key) => {
        if (edited[key] === undefined) {
            delete next[key];
        }
    });
    Object.entries(edited).forEach(([key, value]) => {
        if (value !== undefined) {
            next[key] = remember(next[key], prior[key], value);
        }
    });

    return next;
};

// `before` is the state ahead of the update, as the memory is built from
// plain values rather than drafts
const updateEndpointConfig = (
    state: EndpointConfigState,
    before: EndpointConfigState,
    endpointConfig: JsonFormsData
) => {
    state.endpointConfig = isEmpty(endpointConfig)
        ? createJSONFormDefaults(state.endpointSchema)
        : endpointConfig;
    state.previousEndpointConfig = remember(
        before.previousEndpointConfig,
        before.endpointConfig.data,
        state.endpointConfig.data
    ) as EndpointConfigState['previousEndpointConfig'];

    populateErrors(state.endpointConfig, state.customErrors, state);
    updateActiveSecretNames(state);
};

// Replaced only when it differs, as the form's schema depends on it
const updateActiveSecretNames = (state: EndpointConfigState) => {
    let active: Record<string, string>;
    try {
        active = getActiveSecretNames(
            state.endpointSchema,
            state.endpointConfig.data,
            state.secretNames,
            state.selectedOptions
        );
    } catch {
        active = state.secretNames;
    }

    if (!isEqual(active, state.activeSecretNames)) {
        state.activeSecretNames = active;
    }
};

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

        if (!resolved) {
            get().setHydrationErrorsExist(true);
            return;
        }

        set(
            produce((state: EndpointConfigState) => {
                state.endpointSchema = resolved;
                state.endpointCanBeEmpty = configCanBeEmpty(resolved);
                // These belong to the connector the schema is for
                state.previousEndpointConfig = {};
                state.secretNames = {};
                state.savedSecretNames = {};
                state.activeSecretNames = {};
                state.selectedOptions = {};

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

    setEndpointConfig: (endpointConfig) => {
        const before = get();

        set(
            produce((state: EndpointConfigState) => {
                updateEndpointConfig(state, before, endpointConfig);
            }),
            false,
            'Endpoint Config Changed'
        );
    },

    setSavedEndpointConfig: (config, secrets) => {
        const before = get();

        set(
            produce((state: EndpointConfigState) => {
                state.encryptedEndpointConfig = { data: config };
                if (secrets) {
                    const names = toSecretNames(secrets);
                    state.secretNames = { ...state.secretNames, ...names };
                    state.savedSecretNames = names;
                }

                // A sops config can't be shown in the form, which keeps what
                // it has
                if (isEncryptedConfig(config)) {
                    populateErrors(
                        state.endpointConfig,
                        state.customErrors,
                        state
                    );
                } else {
                    updateEndpointConfig(state, before, {
                        data: config,
                        errors: [],
                    });
                }
                state.savedEndpointConfig = state.endpointConfig;
            }),
            false,
            'Saved Endpoint Config Set'
        );
    },

    setServerUpdateRequired: (updateRequired) => {
        set(
            produce((state: EndpointConfigState) => {
                logRocketEvent('EndpointConfig', {
                    storeUpdate: true,
                    endpointCanBeEmpty: state.endpointCanBeEmpty,
                    updateRequired,
                });

                state.serverUpdateRequired = state.endpointCanBeEmpty
                    ? false
                    : updateRequired;

                populateErrors(state.endpointConfig, state.customErrors, state);
            }),
            false,
            'Server Update Required Flag Changed'
        );
    },

    setSopsPinned: (value) => {
        set(
            produce((state: EndpointConfigState) => {
                state.sopsPinned = value;
            }),
            false,
            'Sops Pinned Changed'
        );
    },

    clearStoredSecrets: (pointer) => {
        set(
            produce((state: EndpointConfigState) => {
                state.secretNames = Object.fromEntries(
                    Object.entries(state.secretNames).filter(
                        ([stored]) => !isAtOrUnder(stored, pointer)
                    )
                );
                updateActiveSecretNames(state);
            }),
            false,
            'Stored Secrets Cleared'
        );
    },

    initializeSelectedOptions: (selectedOptions) => {
        set(
            produce((state: EndpointConfigState) => {
                state.selectedOptions = selectedOptions;
                updateActiveSecretNames(state);
            }),
            false,
            'Selected Options Initialized'
        );
    },

    // The form's data, the selection, and the active secrets change together,
    // so the form never renders one without the others
    switchOption: (pointer, option, defaults, fields) => {
        const path = toPath(pointer);
        const remembered = getAt(get().previousEndpointConfig, path);

        const value =
            isPlainObject(defaults) && isPlainObject(remembered)
                ? { ...(defaults as object), ...pick(remembered, fields) }
                : defaults;

        set(
            produce((state: EndpointConfigState) => {
                state.selectedOptions[pointer] = option;
                if (
                    path.length > 0 &&
                    isPlainObject(state.endpointConfig.data)
                ) {
                    setAt(state.endpointConfig.data, path, value);
                }
                updateActiveSecretNames(state);
            }),
            false,
            'Union Option Switched'
        );

        return value;
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
