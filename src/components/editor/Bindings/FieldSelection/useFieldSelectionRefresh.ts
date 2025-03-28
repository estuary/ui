import useSave from 'src/components/shared/Entity/Actions/useSave';
import useGenerateCatalog from 'src/components/materialization/useGenerateCatalog';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { useCallback, useState } from 'react';
import { CustomEvents } from 'src/services/types';

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

    const refresh = useCallback(
        async (draftIdToUse?: string | null) => {
            setUpdating(true);

            let evaluatedDraftId = draftIdToUse;
            if (!evaluatedDraftId) {
                try {
                    evaluatedDraftId = await generateCatalog(
                        mutateDraftSpec,
                        false // we don't want to skip all the extra updates
                    );
                } catch (_error: unknown) {
                    setUpdating(false);
                }
            }

            // Make sure we have a draft id so we know the generate worked
            //  if this is not returned then the function itself handled showing an error
            if (evaluatedDraftId) {
                try {
                    await saveCatalog(evaluatedDraftId, true);
                } catch (_error: unknown) {
                    setUpdating(false);
                }
            }

            // I do not think this is truly needed but being safe so the user is not stuck with a disabled button
            setUpdating(false);
        },
        [generateCatalog, mutateDraftSpec, saveCatalog]
    );

    return {
        updating,
        refresh,
    };
}

export default useFieldSelectionRefresh;
