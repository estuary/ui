import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useLiveSpecsExtWithSpec } from 'hooks/useLiveSpecsExt';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
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

    const [unchanged, setUnchanged] = useState(false);

    const {
        liveSpecs: [initialSpec],
    } = useLiveSpecsExtWithSpec(liveSpecId, entityType);

    const { draftSpecs } = useDraftSpecs(draftId, lastPubId);

    useEffect(() => {
        setUnchanged(
            evaluateResourceConfigEquality(resourceConfig, [
                initialSpec,
                draftSpecs[0],
            ])
        );
    }, [setUnchanged, draftSpecs, initialSpec, resourceConfig]);

    return unchanged;
}

export default useEvaluateResourceConfigUpdates;
