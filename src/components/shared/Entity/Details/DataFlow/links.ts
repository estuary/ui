import type { DataFlowNodeKind } from 'src/components/shared/Entity/Details/DataFlow/types';

import { authenticatedRoutes } from 'src/app/routes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

const DATA_FLOW_PATHS: Record<DataFlowNodeKind, string> = {
    capture: authenticatedRoutes.captures.details.dataFlow.fullPath,
    collection: authenticatedRoutes.collections.details.dataFlow.fullPath,
    derivation: authenticatedRoutes.collections.details.dataFlow.fullPath,
    materialization:
        authenticatedRoutes.materializations.details.dataFlow.fullPath,
};

// The Data flow tab of another spec, re-centred on it.
export const getDataFlowPath = (kind: DataFlowNodeKind, catalogName: string) =>
    getPathWithParams(DATA_FLOW_PATHS[kind], {
        [GlobalSearchParams.CATALOG_NAME]: catalogName,
    });
