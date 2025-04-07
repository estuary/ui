import type { PostgrestError } from '@supabase/postgrest-js';
import type { Schema } from 'src/types';

import { useCallback } from 'react';

import { getDraftSpecsByDraftId } from 'src/api/draftSpecs';
import {
    getLiveSpecsByLiveSpecId,
    getSchema_Endpoint,
} from 'src/api/hydration';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow } from 'src/context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { BASE_ERROR } from 'src/services/supabase';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { getEndpointConfig } from 'src/utils/connector-utils';
import { parseEncryptedEndpointConfig } from 'src/utils/sops-utils';

const useStoreEndpointSchema = () => {
    const setEndpointSchema = useEndpointConfigStore(
        (state) => state.setEndpointSchema
    );

    const storeEndpointSchema = async (connectorTagId: string) => {
        const { data, error } = await getSchema_Endpoint(connectorTagId);

        if (error || !data) {
            return {
                endpointSchema: null,
                error: error
                    ? (error as PostgrestError)
                    : { ...BASE_ERROR, message: 'endpoint schema not found' },
            };
        }

        const endpointSchema = data.endpoint_spec_schema as unknown as Schema;

        await setEndpointSchema(endpointSchema);

        return { endpointSchema, error: null };
    };

    return { storeEndpointSchema };
};

const useHydrateEndpointConfigDependentState = () => {
    const entityType = useEntityType();

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

    const hydrateEndpointConfigDependentState = async (
        draftId: string,
        liveSpecId: string,
        endpointSchema: Schema
    ) => {
        const { data, error } = draftId
            ? await getDraftSpecsByDraftId(draftId, entityType)
            : await getLiveSpecsByLiveSpecId(liveSpecId, entityType);

        if (error || !data || data.length === 0) {
            const tableTarget = draftId ? 'draft_specs' : 'live_specs';

            return {
                error: error
                    ? (error as PostgrestError)
                    : {
                          ...BASE_ERROR,
                          message: `${tableTarget} data not found`,
                      },
            };
        }

        const encryptedEndpointConfig = getEndpointConfig(data);

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

        return { error: null };
    };

    return { hydrateEndpointConfigDependentState };
};

export const useEndpointConfigHydrator = () => {
    const draftId = useGlobalSearchParams(GlobalSearchParams.DRAFT_ID);
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);

    const workflow = useEntityWorkflow();

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
        async (connectorTagId: string | null) => {
            setActive(true);

            if (!connectorTagId || connectorTagId.length === 0) {
                // TODO: Add a Log Rocket event.
                setHydrated(true);
                setHydrationErrorsExist(true);

                return Promise.reject();
            }

            if (
                workflow === 'capture_create' ||
                workflow === 'materialization_create'
            ) {
                setServerUpdateRequired(true);
            }

            const { endpointSchema, error: endpointSchemaError } =
                await storeEndpointSchema(connectorTagId);

            if (endpointSchemaError || !endpointSchema) {
                setHydrated(true);
                setHydrationErrorsExist(true);

                return Promise.reject();
            }

            if (liveSpecId) {
                const { error: endpointConfigError } =
                    await hydrateEndpointConfigDependentState(
                        draftId,
                        liveSpecId,
                        endpointSchema
                    );

                if (endpointConfigError) {
                    setHydrated(true);
                    setHydrationErrorsExist(true);

                    return Promise.reject();
                }
            }

            setHydrated(true);

            return Promise.resolve();
        },
        [
            draftId,
            hydrateEndpointConfigDependentState,
            liveSpecId,
            setActive,
            setHydrated,
            setHydrationErrorsExist,
            setServerUpdateRequired,
            storeEndpointSchema,
            workflow,
        ]
    );

    return { hydrateEndpointConfig };
};
