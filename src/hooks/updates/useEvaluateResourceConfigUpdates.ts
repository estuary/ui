import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useLiveSpecsExtWithSpec } from 'hooks/useLiveSpecsExt';
import { isEqual } from 'lodash';
import { useMemo } from 'react';
import { ResourceConfigDictionary } from 'stores/ResourceConfig';

const evaluateResourceConfigEquality = (
    resourceConfig: ResourceConfigDictionary,
    queries: any[]
): boolean => {
    const configEquality: boolean[] = queries.map((query) => {
        let queriedResourceConfig: ResourceConfigDictionary = {};

        query?.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [binding.source]: {
                    data: binding.resource,
                    errors: [],
                },
            };
        });

        // TODO (optimization): Evaluate the performance of a hash comparator function.
        return isEqual(resourceConfig, queriedResourceConfig);
    });

    return configEquality.includes(true);
};

function useEvaluateResourceConfigUpdates(
    draftId: string | null,
    resourceConfig: ResourceConfigDictionary
) {
    const [liveSpecId, lastPubId] = useGlobalSearchParams([
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.LAST_PUB_ID,
    ]);

    const entityType = useEntityType();

    const {
        liveSpecs: [initialSpec],
    } = useLiveSpecsExtWithSpec(liveSpecId, entityType);

    const { draftSpecs } = useDraftSpecs(draftId, lastPubId);

    return useMemo(() => {
        return evaluateResourceConfigEquality(resourceConfig, [
            initialSpec,
            draftSpecs[0],
        ]);
    }, [draftSpecs, initialSpec, resourceConfig]);
}

export default useEvaluateResourceConfigUpdates;
