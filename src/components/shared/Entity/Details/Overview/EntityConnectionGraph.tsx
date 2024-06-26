import { Stack } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { EntityNode, getConnectedEntities } from 'api/liveSpecFlows';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import ScopedSystemGraph from 'components/graphs/ScopedSystemGraph';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import Error from 'components/shared/Error';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactFlowProvider } from 'reactflow';
import { FAILED_TO_FETCH, checkErrorMessage } from 'services/shared';
import { hasLength } from 'utils/misc-utils';
import { useScopedSystemGraph } from './Connections/Store/Store';
import NodeSearch from './Connections/Toolbar/Search';

interface Props {
    currentNode: EntityNode;
}

function EntityConnectionsGraph({ currentNode }: Props) {
    const [error, setError] = useState<PostgrestError | null>(null);

    const edges = useScopedSystemGraph((state) => state.edges);
    const nodes = useScopedSystemGraph((state) => state.nodes);
    const initGraphElements = useScopedSystemGraph(
        (state) => state.initGraphElements
    );

    useEffect(() => {
        getConnectedEntities(currentNode.id).then(
            (response) => {
                if (response.error) {
                    setError(response.error);
                }

                if (!response.data) {
                    initGraphElements([], currentNode, []);
                } else {
                    const { children, parents } = response.data;

                    initGraphElements(
                        children ?? [],
                        currentNode,
                        parents ?? []
                    );
                    setError(null);
                }
            },
            () => {}
        );
    }, [currentNode, initGraphElements]);

    return (
        <ReactFlowProvider>
            <CardWrapper
                message={
                    <Stack
                        direction="row"
                        style={{ justifyContent: 'space-between' }}
                    >
                        <FormattedMessage id="details.scopedSystemGraph.header" />

                        <NodeSearch />
                    </Stack>
                }
            >
                {!hasLength(nodes) || !hasLength(edges) ? (
                    <GraphLoadingState />
                ) : error ? (
                    checkErrorMessage(FAILED_TO_FETCH, error.message) ? (
                        <EmptyGraphState
                            header={
                                <FormattedMessage id="entityTable.networkFailed.header" />
                            }
                            message={
                                <FormattedMessage id="entityTable.networkFailed.message" />
                            }
                        />
                    ) : (
                        <Error error={error} />
                    )
                ) : (
                    <ScopedSystemGraph containerId="scoped_system-details" />
                )}
            </CardWrapper>
        </ReactFlowProvider>
    );
}

export default EntityConnectionsGraph;
