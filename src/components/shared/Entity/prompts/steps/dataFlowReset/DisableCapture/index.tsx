import { useEffect } from 'react';

import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import { useIntl } from 'react-intl';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import { createPublication } from 'src/api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
} from 'src/components/editor/Store/hooks';
import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import useCheckPublicationForIncompatibleCollections from 'src/hooks/prompts/useCheckPublicationForIncompatibleCollections';
import usePublicationHandler from 'src/hooks/prompts/usePublicationHandler';
import useStepIsIdle from 'src/hooks/prompts/useStepIsIdle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { generateDisabledSpec } from 'src/utils/entity-utils';

function DisableCapture() {
    const intl = useIntl();

    const publicationHandler = usePublicationHandler();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName.whole
    );

    const persistedDraftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const checkPublicationForIncompatibleCollections =
        useCheckPublicationForIncompatibleCollections();
    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const stepIndex = useLoopIndex();
    const stepIsIdle = useStepIsIdle();

    const [updateStep, updateContext, initUUID, nextStep] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.updateContext,
            state.initUUID,
            state.nextStep,
        ]);

    useEffect(() => {
        if (!stepIsIdle) {
            return;
        }

        updateStep(stepIndex, {
            progress: ProgressStates.RUNNING,
        });

        if (!persistedDraftId) {
            updateStep(stepIndex, {
                error: {
                    message: 'resetDataFlow.errors.missingDraftId',
                },
                progress: ProgressStates.FAILED,
            });
            return;
        }

        updateContext({
            disableClose: true,
        });

        const disableCaptureAndPublish = async () => {
            const newSpec = generateDisabledSpec(
                draftSpecs[0].spec,
                false,
                false
            );

            const captureName = draftSpecs[0].catalog_name;

            // Update the Capture to be disabled
            const updateResponse = await modifyDraftSpec(
                newSpec,
                {
                    draft_id: persistedDraftId,
                    catalog_name: captureName,
                    spec_type: 'capture',
                },
                undefined,
                undefined,
                `${CustomEvents.DATA_FLOW_RESET} : disable capture : ${initUUID}`
            );

            if (updateResponse.error) {
                updateStep(stepIndex, {
                    error: updateResponse.error,
                    progress: ProgressStates.FAILED,
                });
                return;
            }

            // Start publishing it
            const publishResponse = await createPublication(
                persistedDraftId,
                false,
                `${CustomEvents.DATA_FLOW_RESET} : disable capture : ${initUUID}`,
                dataPlaneName
            );

            if (publishResponse.error || !publishResponse.data) {
                updateStep(stepIndex, {
                    error: publishResponse.error,
                    progress: ProgressStates.FAILED,
                });
                return;
            }

            updateContext({
                captureName,
                captureSpec: newSpec,
                initialPubId: publishResponse.data[0].id,
            });

            updateStep(stepIndex, {
                optionalLabel: intl.formatMessage({
                    id: 'common.disabling',
                }),
            });

            publicationHandler(publishResponse.data[0].id, (response) => {
                const [incompatibleCollectionsFound, incompatibleCollections] =
                    checkPublicationForIncompatibleCollections(
                        response,
                        'resetDataFlow.disableCapture.errors.incompatibleCollections'
                    );

                if (incompatibleCollectionsFound) {
                    logRocketEvent(CustomEvents.DATA_FLOW_RESET, {
                        incompatibleCollections: true,
                    });
                    setIncompatibleCollections(incompatibleCollections);
                    return;
                }

                updateStep(stepIndex, {
                    optionalLabel: intl.formatMessage({
                        id: 'common.disabled',
                    }),
                });

                nextStep();
            });
        };

        void disableCaptureAndPublish();
    }, [
        checkPublicationForIncompatibleCollections,
        dataPlaneName,
        persistedDraftId,
        draftSpecs,
        initUUID,
        intl,
        nextStep,
        publicationHandler,
        setIncompatibleCollections,
        stepIndex,
        stepIsIdle,
        updateContext,
        updateStep,
    ]);

    return <DraftErrors draftId={persistedDraftId} />;
}

export default DisableCapture;
