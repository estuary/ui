import type { PostgrestError } from '@supabase/postgrest-js';
import type { Schema } from 'src/types';

import { useCallback } from 'react';

import { getDraftSpecsByDraftId } from 'src/api/draftSpecs';
import { getLiveSpecsByLiveSpecId } from 'src/api/hydration';
import { useConnectorTag } from 'src/context/ConnectorTag';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow } from 'src/context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { getEndpointConfig } from 'src/utils/connector-utils';
import { configCanBeEmpty } from 'src/utils/misc-utils';
import { ENABLE_RUNTIME_V2, getSelectedOptions } from 'src/utils/secrets-utils';
import {
    isEncryptedConfig,
    parseEncryptedEndpointConfig,
} from 'src/utils/sops-utils';

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
    const entityType = useEntityType();

    const setEndpointConfig = useEndpointConfigStore(
        (state) => state.setEndpointConfig
    );
    const setSavedEndpointConfig = useEndpointConfigStore(
        (state) => state.setSavedEndpointConfig
    );
    const setPublishedEndpointConfig = useEndpointConfigStore(
        (state) => state.setPublishedEndpointConfig
    );

    const setSopsPinned = useEndpointConfigStore(
        (state) => state.setSopsPinned
    );
    const initializeSelectedOptions = useEndpointConfigStore(
        (state) => state.initializeSelectedOptions
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

        const endpointConfig = getEndpointConfig(data);
        const { spec } = data[0];
        const flags = spec.shards?.flags ?? {};

        // Stay on sops if the config is already sops encrypted, or the task is
        // pinned to runtime v1, since a secrets stanza needs v2.
        const isNotRuntimeV2 = flags[ENABLE_RUNTIME_V2] === 'false';
        const mustUseSops = isEncryptedConfig(endpointConfig) || isNotRuntimeV2;
        setSopsPinned(mustUseSops);

        setPublishedEndpointConfig({ data: endpointConfig });

        // The form shows a sops config parsed, which saving it keeps
        const parsedConfig = parseEncryptedEndpointConfig(
            endpointConfig,
            endpointSchema
        );
        setEndpointConfig(parsedConfig);
        setSavedEndpointConfig(endpointConfig, spec.secrets);

        // Which option each union has selected, as the data alone can't always
        // tell once its stored secrets aren't in it
        const { endpointSchema: resolvedSchema, secretNames } =
            useEndpointConfigStore.getState();
        initializeSelectedOptions(
            getSelectedOptions(resolvedSchema, parsedConfig.data, secretNames)
        );

        return { error: null };
    };

    return { hydrateEndpointConfigDependentState };
};

export const useEndpointConfigHydrator = () => {
    const connectorTag = useConnectorTag();

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

    const hydrateEndpointConfig = useCallback(async () => {
        setActive(true);

        if (
            workflow === 'capture_create' ||
            workflow === 'materialization_create'
        ) {
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
    }, [
        connectorTag,
        draftId,
        hydrateEndpointConfigDependentState,
        liveSpecId,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setServerUpdateRequired,
        storeEndpointSchema,
        workflow,
    ]);

    return { hydrateEndpointConfig };
};
