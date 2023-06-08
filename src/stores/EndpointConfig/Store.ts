import { getDraftSpecsByDraftId } from 'api/draftSpecs';
import { getLiveSpecsByLiveSpecId, getSchema_Endpoint } from 'api/hydration';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual, map } from 'lodash';
import { createJSONFormDefaults } from 'services/ajv';
import { getStoreWithCustomErrorsSettings } from 'stores/CustomErrors';
import { getStoreWithHydrationSettings } from 'stores/Hydration';
import { EndpointConfigStoreNames } from 'stores/names';
import { JsonFormsData, Schema } from 'types';
import { parseEncryptedEndpointConfig } from 'utils/sops-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { EndpointConfigState } from './types';

const STORE_KEY = 'Endpoint Config';

const fetchErrors = ({ errors }: JsonFormsData): JsonFormsData['errors'] => {
    let response: JsonFormsData['errors'] = [];

    if (errors && errors.length > 0) {
        response = response.concat(errors);
    }

    return response;
};

const filterErrors = (list: JsonFormsData['errors']): (string | undefined)[] =>
    map(list, 'message');

const populateEndpointConfigErrors = (
    endpointConfig: JsonFormsData,
    customErrors: any[],
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
    | 'endpointConfig'
    | 'errorsExist'
    | 'endpointConfigErrors'
    | 'endpointSchema'
    | 'hydrated'
    | 'hydrationErrorsExist'
    | 'previousEndpointConfig'
    | 'publishedEndpointConfig'
    | 'serverUpdateRequired'
    | 'endpointCanBeEmpty'
> => ({
    encryptedEndpointConfig: { data: {}, errors: [] },
    endpointConfig: { data: {}, errors: [] },
    errorsExist: true,
    endpointConfigErrors: [],
    endpointSchema: {},
    hydrated: false,
    hydrationErrorsExist: false,
    previousEndpointConfig: { data: {}, errors: [] },
    publishedEndpointConfig: { data: {}, errors: [] },
    serverUpdateRequired: false,
    endpointCanBeEmpty: false,
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

                const { endpointConfig } = get();

                // Setting this so that if there is a custom error then the
                //  generate button will not proceed
                populateEndpointConfigErrors(endpointConfig, val, state);
            }),
            false,
            'Endpoint Custom Errors Set'
        );
    },

    setEndpointSchema: (val) => {
        set(
            produce((state: EndpointConfigState) => {
                state.endpointSchema = val;

                const { endpointConfig, customErrors } = get();

                populateEndpointConfigErrors(
                    endpointConfig,
                    customErrors,
                    state
                );
            }),
            false,
            'Endpoint Schema Set'
        );
    },

    setPublishedEndpointConfig: (encryptedEndpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema } = get();

                state.publishedEndpointConfig = isEmpty(encryptedEndpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : encryptedEndpointConfig;
            }),
            false,
            'Published Endpoint Config Set'
        );
    },

    setEncryptedEndpointConfig: (encryptedEndpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema, customErrors } = get();

                state.encryptedEndpointConfig = isEmpty(encryptedEndpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : encryptedEndpointConfig;

                populateEndpointConfigErrors(
                    encryptedEndpointConfig,
                    customErrors,
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
                const { endpointSchema } = get();

                state.previousEndpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : endpointConfig;
            }),
            false,
            'Previous Endpoint Config Changed'
        );
    },

    setEndpointConfig: (endpointConfig) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointSchema, customErrors } = get();

                state.endpointConfig = isEmpty(endpointConfig)
                    ? createJSONFormDefaults(endpointSchema)
                    : endpointConfig;

                populateEndpointConfigErrors(
                    state.endpointConfig,
                    customErrors,
                    state
                );
            }),
            false,
            'Endpoint Config Changed'
        );
    },

    setServerUpdateRequired: (updateRequired) => {
        set(
            produce((state: EndpointConfigState) => {
                const { endpointConfig, customErrors } = get();

                state.serverUpdateRequired = updateRequired;

                populateEndpointConfigErrors(
                    endpointConfig,
                    customErrors,
                    state
                );
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

    hydrateState: async (entityType, workflow): Promise<void> => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);
        const draftId = searchParams.get(GlobalSearchParams.DRAFT_ID);

        if (
            workflow === 'capture_create' ||
            workflow === 'materialization_create'
        ) {
            const { setServerUpdateRequired } = get();

            setServerUpdateRequired(true);
        }

        if (connectorId) {
            const { data, error } = await getSchema_Endpoint(connectorId);

            if (error) {
                const { setHydrationErrorsExist } = get();

                setHydrationErrorsExist(true);
            }

            if (data && data.length > 0) {
                const { setEndpointSchema } = get();

                setEndpointSchema(
                    data[0].endpoint_spec_schema as unknown as Schema
                );
            }
        }

        if (liveSpecId) {
            const { data, error } = draftId
                ? await getDraftSpecsByDraftId(draftId, entityType)
                : await getLiveSpecsByLiveSpecId(liveSpecId, entityType);

            if (error) {
                const { setHydrationErrorsExist } = get();

                setHydrationErrorsExist(true);
            }

            if (data && data.length > 0) {
                const {
                    setEncryptedEndpointConfig,
                    setEndpointConfig,
                    setPreviousEndpointConfig,
                    setPublishedEndpointConfig,
                    endpointSchema,
                } = get();

                const encryptedEndpointConfig =
                    data[0].spec.endpoint.connector.config;

                setEncryptedEndpointConfig({ data: encryptedEndpointConfig });

                setPublishedEndpointConfig({ data: encryptedEndpointConfig });

                const endpointConfig = parseEncryptedEndpointConfig(
                    encryptedEndpointConfig,
                    endpointSchema
                );

                setPreviousEndpointConfig(endpointConfig);

                setEndpointConfig(endpointConfig);
            }
        }
    },

    stateChanged: () => {
        const { encryptedEndpointConfig, publishedEndpointConfig } = get();

        return !isEqual(encryptedEndpointConfig, publishedEndpointConfig);
    },

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
                ...getStoreWithCustomErrorsSettings(STORE_KEY),
            },
            false,
            'Endpoint Config State Reset'
        );
    },
});

export const createEndpointConfigStore = (key: EndpointConfigStoreNames) => {
    return create<EndpointConfigState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
