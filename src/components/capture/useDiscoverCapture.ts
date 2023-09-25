import {
    useEditorStore_isSaving,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
} from 'components/editor/Store/hooks';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import useEntityNameSuffix from 'hooks/useEntityNameSuffix';
import { useCallback, useMemo } from 'react';
import { useDetailsForm_errorsExist } from 'stores/DetailsForm/hooks';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_errorsExist,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_resourceConfigErrorsExist } from 'stores/ResourceConfig/hooks';
import { Entity } from 'types';
import useDiscoverConfigEncrypt from './useCaptureConfigEncrypt';
import useDiscoverDraftUpdate from './useCaptureDraftUpdate';
import useDiscoverStartDiscovery from './useDiscoverStartDiscovery';

function useDiscoverCapture(
    entityType: Entity,
    postGenerateMutate: Function,
    options?: { initiateRediscovery?: boolean; initiateDiscovery?: boolean }
) {
    const draftUpdate = useDiscoverDraftUpdate(postGenerateMutate, options);
    const configEncrypt = useDiscoverConfigEncrypt();
    const startDiscovery = useDiscoverStartDiscovery(
        entityType,
        postGenerateMutate
    );

    const isEdit = useEntityWorkflow_Editing();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();
    const isSaving = useEditorStore_isSaving();
    const resetEditorState = useEditorStore_resetState();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

    // Details Form Store
    const detailsFormsHasErrors = useDetailsForm_errorsExist();

    // Endpoint Config Store
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const serverEndpointConfigData =
        useEndpointConfigStore_encryptedEndpointConfig_data();
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    // Resource Config Store
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();

    // If we are doing an initial discovery add the name name to the name
    // If not we are either refreshing collections during create OR during edit
    //  Refreshing during:
    //    create requires draftedEntityName because it has the connector image added to it
    //    edit   requires entityName        because it is the name already in the system and
    //                                        we do not have a draftedEntityName yet
    const processedEntityName = useEntityNameSuffix(
        !isEdit && options?.initiateDiscovery
    );

    const generateCatalog = useCallback(
        async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();
            updateFormStatus(FormStatus.GENERATING);

            if (
                detailsFormsHasErrors ||
                endpointConfigErrorsExist ||
                resourceConfigHasErrors
            ) {
                setFormState({
                    status: FormStatus.FAILED,
                    displayValidation: true,
                });

                return false;
            }
            resetEditorState(true);

            const encryptedEndpointConfig = await configEncrypt(
                serverUpdateRequired
                    ? endpointConfigData
                    : serverEndpointConfigData
            );
            if (encryptedEndpointConfig === false) {
                return false;
            }

            const draftUpdateSuccess = await draftUpdate(
                encryptedEndpointConfig.data
            );
            if (!draftUpdateSuccess) {
                return false;
            }

            if (options?.initiateRediscovery || options?.initiateDiscovery) {
                const discoveryStartSuccess = await startDiscovery(
                    processedEntityName,
                    encryptedEndpointConfig.data,
                    options.initiateRediscovery
                );

                return discoveryStartSuccess;
            } else if (persistedDraftId) {
                // if we got here we already did the update up above
                setFormState({
                    status: FormStatus.GENERATED,
                });

                return true;
            } else {
                // TODO (optimization): This condition should be nearly impossible to reach, but we currently do not have a means to produce
                //   an error in this scenario. ValidationErrorSummary is not suitable for this scenario and EntityError, the error component
                //   that surfaces form state errors, is only rendered in the event a persisted draft ID is present. Since the likelihood of
                //   reaching this code block is slim, I am going to add a solution in a fast-follow to the schema inference changes.
                return false;
            }
        },
        [
            configEncrypt,
            detailsFormsHasErrors,
            draftUpdate,
            endpointConfigData,
            endpointConfigErrorsExist,
            options?.initiateDiscovery,
            options?.initiateRediscovery,
            persistedDraftId,
            processedEntityName,
            resetEditorState,
            resourceConfigHasErrors,
            serverEndpointConfigData,
            serverUpdateRequired,
            setFormState,
            startDiscovery,
            updateFormStatus,
        ]
    );

    return useMemo(() => {
        return {
            isSaving,
            formActive,
            generateCatalog,
        };
    }, [generateCatalog, formActive, isSaving]);
}

export default useDiscoverCapture;
