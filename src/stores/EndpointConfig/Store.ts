import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import { getLiveSpecsByLiveSpecId, getSchema_Endpoint } from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { logRocketConsole } from 'services/shared';
import {
    CustomError,
    fetchErrors,
    filterErrors,
    getInitialCustomErrorsData,
    getStoreWithCustomErrorsSettings,
} from 'stores/extensions/CustomErrors';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { JsonFormsData, Schema } from 'types';
import { getEndpointConfig } from 'utils/connector-utils';
import {
    configCanBeEmpty,
    getDereffedSchema,
    hasLength,
} from 'utils/misc-utils';
import { parseEncryptedEndpointConfig } from 'utils/sops-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EndpointConfigState } from './types';

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

    hydrateState: async (
        entityType,
        workflow,
        connectorTagId
    ): Promise<void> => {
        const searchParams = new URLSearchParams(window.location.search);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);
        const draftId = searchParams.get(GlobalSearchParams.DRAFT_ID);

        get().setHydrated(false);

        if (
            workflow === 'capture_create' ||
            workflow === 'materialization_create'
        ) {
            get().setServerUpdateRequired(true);
        }

        logRocketConsole('EndpointConfigHydrator>hydrateState', {
            active: get().active,
        });

        if (get().active && connectorTagId && connectorTagId.length > 0) {
            logRocketConsole(
                'EndpointConfigHydrator>hydrateState>fetch>getSchema_Endpoint',
                {
                    active: get().active,
                }
            );

            const { data, error } = await getSchema_Endpoint(connectorTagId);

            if (error) {
                logRocketConsole(
                    'EndpointConfigHydrator>hydrateState>fetch>setHydrationErrorsExist',
                    {
                        active: get().active,
                    }
                );
                get().setHydrationErrorsExist(true);
            }

            if (get().active && data) {
                logRocketConsole(
                    'EndpointConfigHydrator>hydrateState>fetch>setEndpointSchema'
                );

                await get().setEndpointSchema(
                    data.endpoint_spec_schema as unknown as Schema
                );
            }
        }

        if (get().active && liveSpecId) {
            const { data, error } = draftId
                ? await getDraftSpecsByDraftId(draftId, entityType)
                : await getLiveSpecsByLiveSpecId(liveSpecId, entityType);

            if (error) {
                get().setHydrationErrorsExist(true);
            }

            if (get().active && data && data.length > 0) {
                const encryptedEndpointConfig = getEndpointConfig(data);

                get().setEncryptedEndpointConfig({
                    data: encryptedEndpointConfig,
                });

                get().setPublishedEndpointConfig({
                    data: encryptedEndpointConfig,
                });

                const endpointConfig = parseEncryptedEndpointConfig(
                    encryptedEndpointConfig,
                    get().endpointSchema
                );

                get().setPreviousEndpointConfig(endpointConfig);

                get().setEndpointConfig(endpointConfig);
            }
        }
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
