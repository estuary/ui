import { PostgrestError } from '@supabase/postgrest-js';
import {
    DirectConnections,
    EntityNode,
    getConnectedEntities,
} from 'api/liveSpecFlows';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import ScopedSystemGraph from 'components/graphs/ScopedSystemGraph';
import EmptyGraphState from 'components/graphs/states/Empty';
import GraphLoadingState from 'components/graphs/states/Loading';
import Error from 'components/shared/Error';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { FAILED_TO_FETCH, checkErrorMessage } from 'services/shared';

interface Props {
    currentNode: EntityNode;
}

function EntityConnectionsGraph({ currentNode }: Props) {
    const [nodes, setNodes] = useState<DirectConnections | null>(null);
    const [error, setError] = useState<PostgrestError | null>(null);

    useEffect(() => {
        getConnectedEntities(currentNode.id).then(
            (response) => {
                if (response.error) {
                    setError(response.error);
                }

                if (!response.data) {
                    setNodes({ children: [], parents: [] });
                } else {
                    const { children, parents } = response.data;

                    setNodes({
                        children: children ?? [],
                        parents: parents ?? [],
                    });
                    setError(null);
                }
            },
            () => {}
        );
    }, [currentNode, setNodes]);

    return (
        <CardWrapper
            message={<FormattedMessage id="details.scopedSystemGraph.header" />}
        >
            {!nodes ? (
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
            ) : nodes.parents.length > 0 || nodes.children.length > 0 ? (
                <ScopedSystemGraph
                    childNodes={nodes.children}
                    currentNode={currentNode}
                    containerId="scoped_system-details"
                    parentNodes={nodes.parents}
                />
            ) : (
                <EmptyGraphState
                    message={
                        <FormattedMessage id="graphs.entityDetails.empty.message" />
                    }
                />
            )}
        </CardWrapper>
    );
}

export default EntityConnectionsGraph;
