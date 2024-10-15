import { IncompatibleCollections } from 'api/evolutions';
import { usePreSavePromptStore } from 'components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useCallback } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { hasLength } from 'utils/misc-utils';

function useIncompatibleCollectionChecker() {
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

export default useIncompatibleCollectionChecker;
