import { getLiveSpecIdByPublication } from 'api/publicationSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import { useBindingsEditorStore_resetState } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_catalogName,
    useEditorStore_pubId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { logRocketConsole, logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBinding_resetState } from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useSchemaEvolution_resetState } from 'stores/SchemaEvolution/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { useTransformationCreate_resetState } from 'stores/TransformationCreate/hooks';
import { getPathWithParams } from 'utils/misc-utils';
import { snackbarSettings } from 'utils/notification-utils';
import { usePreSavePromptStore } from '../prompts/store/usePreSavePromptStore';

function useEntityWorkflowHelpers() {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const entityType = useEntityType();
    const intl = useIntl();

    // Binding Store
    const resetBindingState = useBinding_resetState();

    // Bindings Editor Store
    const resetBindingsEditorStore = useBindingsEditorStore_resetState();

    // Details Form Store
    const resetDetailsFormState = useDetailsFormStore(
        (state) => state.resetState
    );
    // Draft Editor Store
    const pubId = useEditorStore_pubId();
    const resetEditorStore = useEditorStore_resetState();
    const catalogName = useEditorStore_catalogName();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Schema Evolution Store
    const resetSchemaEvolutionState = useSchemaEvolution_resetState();

    // Source Capture Store
    const resetSourceCapture = useSourceCaptureStore(
        (state) => state.resetState
    );

    // Transformation Create Store
    const resetTransformationCreateState = useTransformationCreate_resetState();

    // PreSave Prompt Store
    const resetPreSavePrompt = usePreSavePromptStore(
        (state) => state.resetState
    );

    const resetState = useCallback(() => {
        resetPreSavePrompt();
        resetFormState();
        resetEndpointConfigState();
        resetDetailsFormState();
        resetBindingState(undefined, true);
        resetEditorStore();
        resetBindingsEditorStore();
        resetSchemaEvolutionState();
        resetSourceCapture();
        resetTransformationCreateState();
    }, [
        resetBindingState,
        resetBindingsEditorStore,
        resetDetailsFormState,
        resetEditorStore,
        resetEndpointConfigState,
        resetFormState,
        resetPreSavePrompt,
        resetSchemaEvolutionState,
        resetSourceCapture,
        resetTransformationCreateState,
    ]);

    const callFailed = useCallback(
        (formState: any) => {
            const setFailureState = () => {
                setFormState({
                    status: FormStatus.FAILED,
                    exitWhenLogsClose: false,
                    ...formState,
                });
            };

            setFailureState();
        },
        [setFormState]
    );

    const entityDetailsBaseURL = useMemo(() => {
        if (entityType === 'capture') {
            return authenticatedRoutes.captures.details.overview.fullPath;
        } else if (entityType === 'materialization') {
            return authenticatedRoutes.materializations.details.overview
                .fullPath;
        } else {
            return authenticatedRoutes.collections.details.overview.fullPath;
        }
    }, [entityType]);

    const { generatePath } = useDetailsNavigator(entityDetailsBaseURL);

    const exit = useCallback(
        (customRoute?: string) => {
            logRocketConsole('EntityWorkflow:exit');
            resetState();

            let route: string;
            if (!customRoute) {
                route = generatePath({ catalog_name: catalogName });
            } else {
                route = customRoute;
            }

            logRocketConsole('EntityWorkflow:exit:navigate');
            navigate(route, { replace: true });
        },
        [catalogName, generatePath, navigate, resetState]
    );

    // Form Event Handlers
    const closeLogs = useCallback(() => {
        logRocketConsole('EntityWorkflow:closeLogs');
        setFormState({
            showLogs: false,
        });

        if (exitWhenLogsClose) {
            logRocketConsole('EntityWorkflow:closeLogs:exit');
            exit();
        }
    }, [exit, setFormState, exitWhenLogsClose]);

    const materializeCollections = useCallback(async () => {
        // Go fetch the live spec that we want to materialize
        const liveSpecResponse = await getLiveSpecIdByPublication(
            pubId,
            catalogName
        );

        const liveSpecId = liveSpecResponse.data?.[0]?.live_spec_id;

        if (!liveSpecId) {
            enqueueSnackbar(
                intl.formatMessage({
                    id: 'entityCreate.errors.cannotFetchLiveSpec',
                }),
                {
                    ...snackbarSettings,
                    variant: 'error',
                }
            );
            logRocketEvent(CustomEvents.CAPTURE_MATERIALIZE_FAILED);
        } else {
            logRocketEvent(CustomEvents.CAPTURE_MATERIALIZE_SUCCESS);
            exit(
                getPathWithParams(
                    authenticatedRoutes.materializations.create.fullPath,
                    {
                        [GlobalSearchParams.PREFILL_LIVE_SPEC_ID]: liveSpecId,
                    }
                )
            );
        }
    }, [catalogName, enqueueSnackbar, exit, intl, pubId]);

    return { callFailed, closeLogs, exit, materializeCollections, resetState };
}

export default useEntityWorkflowHelpers;
