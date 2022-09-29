import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useLiveSpecsExtWithSpec } from 'hooks/useLiveSpecsExt';
import { isEqual } from 'lodash';
import { useMemo } from 'react';
import { JsonFormsData } from 'types';

const evaluateEndpointConfigEquality = (
    endpointConfig: Partial<JsonFormsData>,
    queries: any[]
): boolean => {
    const configEquality: boolean[] = queries.map((query) => {
        // TODO (optimization): Evaluate the performance of a hash comparator function.
        return isEqual(endpointConfig, query?.spec.endpoint.connector.config);
    });

    return configEquality.includes(true);
};

function useEvaluateEndpointConfigChanges(
    draftId: string | null,
    endpointConfig: Partial<JsonFormsData>
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
        return evaluateEndpointConfigEquality(endpointConfig, [
            initialSpec,
            draftSpecs[0],
        ]);
    }, [draftSpecs, initialSpec, endpointConfig]);
}

export default useEvaluateEndpointConfigChanges;
