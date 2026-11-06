import type { Schema } from 'src/types';
import type { SpecDef } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { useConnectorTag } from 'src/context/ConnectorTag';
import {
    useEntityWorkflow_Creating,
    useEntityWorkflow_Editing,
} from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { getEndpointFromSpecDef } from 'src/utils/connector-utils';
import { configCanBeEmpty } from 'src/utils/misc-utils';
import { parseEncryptedEndpointConfig } from 'src/utils/sops-utils';

const useStoreEndpointSchema = () => {
    const setEndpointSchema = useEndpointConfigStore(
        (state) => state.setEndpointSchema
    );
    const setEndpointCanBeEmpty = useEndpointConfigStore(
        (state) => state.setEndpointCanBeEmpty
    );

    const storeEndpointSchema = async (endpointSpecSchema: any) => {
        if (!endpointSpecSchema) {
            return {
                endpointSchema: null,
                error: { ...BASE_ERROR, message: 'endpoint schema not found' },
            };
        }

        await setEndpointSchema(endpointSpecSchema);

        setEndpointCanBeEmpty(configCanBeEmpty(endpointSpecSchema));

        return { endpointSchema: endpointSpecSchema, error: null };
    };

    return { storeEndpointSchema };
};

const useHydrateEndpointConfigDependentState = () => {
    const setEncryptedEndpointConfig = useEndpointConfigStore(
        (state) => state.setEncryptedEndpointConfig
    );
    const setEndpointConfig = useEndpointConfigStore(
        (state) => state.setEndpointConfig
    );
    const setPreviousEndpointConfig = useEndpointConfigStore(
        (state) => state.setPreviousEndpointConfig
    );
    const setPublishedEndpointConfig = useEndpointConfigStore(
        (state) => state.setPublishedEndpointConfig
    );

    const hydrateEndpointConfigDependentState = (
        spec: SpecDef,
        endpointSchema: Schema
    ) => {
        const encryptedEndpointConfig = getEndpointFromSpecDef(spec)
            ?.config as Schema;

        setEncryptedEndpointConfig({
            data: encryptedEndpointConfig,
        });

        setPublishedEndpointConfig({
            data: encryptedEndpointConfig,
        });

        const endpointConfig = parseEncryptedEndpointConfig(
            encryptedEndpointConfig,
            endpointSchema
        );

        setPreviousEndpointConfig(endpointConfig);

        setEndpointConfig(endpointConfig);
    };

    return { hydrateEndpointConfigDependentState };
};

export const useEndpointConfigHydrator = () => {
    const connectorTag = useConnectorTag();

    const isCreateWorkflow = useEntityWorkflow_Creating();
    const isEditWorkflow = useEntityWorkflow_Editing();

    const setActive = useEndpointConfigStore((state) => state.setActive);
    const setHydrated = useEndpointConfigStore((state) => state.setHydrated);
    const setHydrationErrorsExist = useEndpointConfigStore(
        (state) => state.setHydrationErrorsExist
    );
    const setServerUpdateRequired = useEndpointConfigStore(
        (state) => state.setServerUpdateRequired
    );

    const { storeEndpointSchema } = useStoreEndpointSchema();
    const { hydrateEndpointConfigDependentState } =
        useHydrateEndpointConfigDependentState();

    const hydrateEndpointConfig = useCallback(
        async (spec: SpecDef | null) => {
            setActive(true);

            // a spec is required if editing
            if (isEditWorkflow && spec === null) {
                setHydrated(true);
                setHydrationErrorsExist(true);
                return Promise.reject(new Error('Spec not found'));
            }

            if (isCreateWorkflow) {
                logRocketEvent('EndpointConfig', {
                    hydrationDefault: true,
                });
                setServerUpdateRequired(true);
            }

            const { endpointSchema, error: endpointSchemaError } =
                await storeEndpointSchema(connectorTag.endpointSpecSchema);
            if (endpointSchemaError || !endpointSchema) {
                setHydrated(true);
                setHydrationErrorsExist(true);

                return Promise.reject(
                    new Error(
                        endpointSchemaError?.message ??
                            'endpoint schema not found'
                    )
                );
            }

            if (spec) {
                hydrateEndpointConfigDependentState(spec, endpointSchema);
            }

            setHydrated(true);

            return Promise.resolve();
        },
        [
            connectorTag.endpointSpecSchema,
            hydrateEndpointConfigDependentState,
            isCreateWorkflow,
            isEditWorkflow,
            setActive,
            setHydrated,
            setHydrationErrorsExist,
            setServerUpdateRequired,
            storeEndpointSchema,
        ]
    );

    return { hydrateEndpointConfig };
};
