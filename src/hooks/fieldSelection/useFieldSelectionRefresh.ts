import { useCallback, useState } from 'react';

import useGenerateCatalog from 'src/components/materialization/useGenerateCatalog';
import useSave from 'src/components/shared/Entity/Actions/useSave';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';

function useFieldSelectionRefresh() {
    const [updating, setUpdating] = useState(false);

    const { callFailed } = useEntityWorkflowHelpers();

    const generateCatalog = useGenerateCatalog();
    const mutateDraftSpec = useMutateDraftSpec();

    const saveCatalog = useSave(
        CustomEvents.MATERIALIZATION_TEST,
        callFailed,
        true
    );

    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );

    const refresh = useCallback(
        async (draftIdToUse?: string | null) => {
            setUpdating(true);
            advanceHydrationStatus('HYDRATED', undefined, true);

            let evaluatedDraftId = draftIdToUse;
            if (!evaluatedDraftId) {
                try {
                    evaluatedDraftId = await generateCatalog(
                        mutateDraftSpec,
                        false // we don't want to skip all the extra updates
                    ).finally(() => advanceHydrationStatus('RESET_REQUESTED'));
                } catch (_error: unknown) {
                    setUpdating(false);
                }
            }

            // Make sure we have a draft id so we know the generate worked
            //  if this is not returned then the function itself handled showing an error
            if (evaluatedDraftId) {
                try {
                    await saveCatalog(evaluatedDraftId, true).finally(() =>
                        advanceHydrationStatus('SERVER_UPDATING')
                    );
                } catch (_error: unknown) {
                    setUpdating(false);
                }
            }

            // I do not think this is truly needed but being safe so the user is not stuck with a disabled button
            setUpdating(false);
        },
        [advanceHydrationStatus, generateCatalog, mutateDraftSpec, saveCatalog]
    );

    return {
        updating,
        refresh,
    };
}

export default useFieldSelectionRefresh;
