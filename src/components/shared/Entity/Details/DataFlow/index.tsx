import { Alert, Skeleton } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import { DataFlowView } from 'src/components/shared/Entity/Details/DataFlow/DataFlowView';
import { useDataFlowGraph } from 'src/components/shared/Entity/Details/DataFlow/useDataFlowGraph';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function DataFlowContent({ catalogName }: { catalogName: string }) {
    const { graph, error, loading, depth, showMore } =
        useDataFlowGraph(catalogName);

    if (error) {
        return (
            <Alert severity="error">
                {`The data flow could not be loaded: ${error.message}`}
            </Alert>
        );
    }

    if (!graph) {
        return <Skeleton variant="rounded" height={320} />;
    }

    return (
        <DataFlowView
            graph={graph}
            depth={depth}
            loading={loading}
            onShowMore={showMore}
        />
    );
}

export function DataFlow() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        // disableMinWidth: the canvas scrolls and zooms, so the card must not grow
        // to the graph's natural width.
        <CardWrapper message="Data flow" disableMinWidth>
            {catalogName ? (
                // Keyed so selection and depth reset when the centre changes.
                <DataFlowContent key={catalogName} catalogName={catalogName} />
            ) : null}
        </CardWrapper>
    );
}
