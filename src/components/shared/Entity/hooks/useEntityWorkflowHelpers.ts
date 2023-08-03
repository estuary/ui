import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/routes';
import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_pubId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
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
import { useTransformationCreate_resetState } from 'stores/TransformationCreate/hooks';
import { getPathWithParams } from 'utils/misc-utils';

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

    // Transformation Create Store
    const resetTransformationCreateState = useTransformationCreate_resetState();

    const resetState = () => {
        resetFormState();
        resetEndpointConfigState();
        resetDetailsFormState();
        resetResourceConfigState();
        resetEditorStore();
        resetBindingsEditorStore();
        resetTransformationCreateState();
    };

    const callFailed = (
        formState: any,
        subscription?: RealtimeSubscription
    ) => {
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
    };

    const exit = () => {
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
    };

    // Form Event Handlers
    const closeLogs = () => {
        setFormState({
            showLogs: false,
        });

        if (exitWhenLogsClose) {
            exit();
        }
    };

    const materializeCollections = () => {
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
    };

    return { callFailed, closeLogs, exit, materializeCollections, resetState };
}

export default useEntityWorkflowHelpers;
