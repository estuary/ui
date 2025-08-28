import { useCallback } from 'react';

import useGenerateCatalog from 'src/components/materialization/useGenerateCatalog';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';

function useFieldSelectionRefresh() {
    const { callFailed } = useEntityWorkflowHelpers();

    const generateCatalog = useGenerateCatalog();
    const mutateDraftSpec = useMutateDraftSpec();

    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );

    const saveCatalog = useSave(
        CustomEvents.MATERIALIZATION_TEST,
        callFailed,
        true
    );

    const refresh = useCallback(
        async (draftIdToUse?: string | null) => {
            advanceHydrationStatus('HYDRATED', undefined, true);

            let evaluatedDraftId = draftIdToUse;
            if (!evaluatedDraftId) {
                try {
                    evaluatedDraftId = await generateCatalog(
                        mutateDraftSpec,
                        false, // we don't want to skip all the extra updates
                        true
                    ).finally(() => advanceHydrationStatus('RESET_REQUESTED'));
                } catch (error: unknown) {
                    logRocketEvent(CustomEvents.FIELD_SELECTION, {
                        error: true,
                    });
                    logRocketConsole('field selection error', error);
                }
            }

            // Make sure we have a draft id so we know the generate worked
            //  if this is not returned then the function itself handled showing an error
            if (evaluatedDraftId) {
                try {
                    const onError = (dryRun: boolean | undefined) => {
                        if (!dryRun) {
                            return;
                        }

                        advanceHydrationStatus(
                            'SERVER_UPDATING',
                            undefined,
                            undefined,
                            true
                        );
                    };

                    const onFinish = (dryRun: boolean | undefined) => {
                        if (!dryRun) {
                            return;
                        }

                        advanceHydrationStatus('SERVER_UPDATING');
                    };

                    await saveCatalog(
                        evaluatedDraftId,
                        true,
                        onFinish,
                        onError
                    );
                } catch (error: unknown) {
                    logRocketEvent(CustomEvents.FIELD_SELECTION, {
                        error: true,
                    });
                    logRocketConsole('field selection error', error);
                }
            }
        },
        [advanceHydrationStatus, generateCatalog, mutateDraftSpec, saveCatalog]
    );

    return {
        refresh,
    };
}

export default useFieldSelectionRefresh;
