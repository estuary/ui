import { useCallback } from 'react';

import type { IncompatibleCollections } from 'src/api/evolutions';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { hasLength } from 'src/utils/misc-utils';

function useCheckPublicationForIncompatibleCollections() {
    const stepIndex = useLoopIndex();

    const [updateStep] = usePreSavePromptStore((state) => [state.updateStep]);

    return useCallback(
        (
            response: any,
            messageKey = 'resetDataFlow.errors.incompatibleCollections'
        ): [false, null] | [true, IncompatibleCollections[]] => {
            const incompatibleCollections =
                response?.job_status?.incompatible_collections;

            // If we hit this basically just stop everything and tell the user
            if (hasLength(incompatibleCollections)) {
                updateStep(stepIndex, {
                    allowRetry: false,
                    error: {
                        message: messageKey,
                    },
                });

                logRocketEvent(CustomEvents.DATA_FLOW_RESET, {
                    incompatibleCollections: true,
                });

                return [true, incompatibleCollections];
            }

            return [false, null];
        },
        [stepIndex, updateStep]
    );
}

export default useCheckPublicationForIncompatibleCollections;
