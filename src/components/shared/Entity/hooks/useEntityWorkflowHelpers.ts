import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/routes';
import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_pubId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import invariableStores from 'context/Zustand/invariableStores';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetailsForm_resetState } from 'stores/DetailsForm/hooks';
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_resetState } from 'stores/ResourceConfig/hooks';
import { useSchemaEvolution_resetState } from 'stores/SchemaEvolution/hooks';
import { useTransformationCreate_resetState } from 'stores/TransformationCreate/hooks';
import { getPathWithParams } from 'utils/misc-utils';
import { useStore } from 'zustand';

function useEntityWorkflowHelpers() {
    const navigate = useNavigate();

    const entityType = useEntityType();

    // Supabase
    const supabaseClient = useClient();

    // Bindings Editor Store
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();

    // Details Form Store
    const resetDetailsFormState = useDetailsForm_resetState();

    // Draft Editor Store
    const pubId = useEditorStore_pubId();
    const resetEditorStore = useEditorStore_resetState();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    const resetResourceConfigState = useResourceConfig_resetState();

    // Schema Evolution Store
    const resetSchemaEvolutionState = useSchemaEvolution_resetState();

    // Source Capture Store
    const resetSourceCapture = useStore(
        invariableStores['source-capture'],
        (state) => state.resetState
    );

    // Transformation Create Store
    const resetTransformationCreateState = useTransformationCreate_resetState();

    const resetState = useCallback(() => {
        resetFormState();
        resetEndpointConfigState();
        resetDetailsFormState();
        resetResourceConfigState();
        resetEditorStore();
        resetBindingsEditorStore();
        resetSchemaEvolutionState();
        resetSourceCapture();
        resetTransformationCreateState();
    }, [
        resetBindingsEditorStore,
        resetDetailsFormState,
        resetEditorStore,
        resetEndpointConfigState,
        resetFormState,
        resetResourceConfigState,
        resetSchemaEvolutionState,
        resetSourceCapture,
        resetTransformationCreateState,
    ]);

    const callFailed = useCallback(
        (formState: any, subscription?: RealtimeSubscription) => {
            const setFailureState = () => {
                setFormState({
                    status: FormStatus.FAILED,
                    exitWhenLogsClose: false,
                    ...formState,
                });
            };

            if (subscription) {
                supabaseClient
                    .removeSubscription(subscription)
                    .then(() => {
                        setFailureState();
                    })
                    .catch(() => {});
            } else {
                setFailureState();
            }
        },
        [setFormState, supabaseClient]
    );

    const exit = useCallback(() => {
        resetState();

        let route: string;

        switch (entityType) {
            case 'capture':
                route = authenticatedRoutes.captures.fullPath;
                break;
            case 'materialization':
                route = authenticatedRoutes.materializations.fullPath;
                break;
            default:
                route = authenticatedRoutes.collections.fullPath;
        }

        navigate(route, { replace: true });
    }, [navigate, resetState, entityType]);

    // Form Event Handlers
    const closeLogs = useCallback(() => {
        setFormState({
            showLogs: false,
        });

        if (exitWhenLogsClose) {
            exit();
        }
    }, [exit, setFormState, exitWhenLogsClose]);

    const materializeCollections = useCallback(() => {
        exit();

        navigate(
            pubId
                ? getPathWithParams(
                      authenticatedRoutes.materializations.create.fullPath,
                      {
                          [GlobalSearchParams.PREFILL_PUB_ID]: pubId,
                      }
                  )
                : authenticatedRoutes.materializations.create.fullPath
        );
    }, [exit, navigate, pubId]);

    return { callFailed, closeLogs, exit, materializeCollections, resetState };
}

export default useEntityWorkflowHelpers;
