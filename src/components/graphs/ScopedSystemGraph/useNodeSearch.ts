import { Node } from 'components/graphs/ScopedSystemGraph';
import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import { Core } from 'cytoscape';
import { SyntheticEvent, useCallback, useMemo } from 'react';

export interface Options {
    [id: string]: string;
}

function useNodeSearch(cyCore: Core | null, nodes: Node[]) {
    const searchOptions = useMemo(() => {
        const options: Options = {};

        nodes.forEach(({ data: { id, name } }) => {
            options[id] = name;
        });

        return options;
    }, [nodes]);

    const searchedNodeId = useScopedSystemGraph(
        (state) => state.searchedNodeId
    );
    const setSearchedNodeId = useScopedSystemGraph(
        (state) => state.setSearchedNodeId
    );

    const onSelectOption = useCallback(
        (event: SyntheticEvent<Element, Event>, value: string | null) => {
            event.preventDefault();
            event.stopPropagation();

            if (value) {
                const node = cyCore?.$id(value);

                node?.addClass('highlight');
                cyCore?.center(node);
            } else if (searchedNodeId && !value) {
                const node = cyCore?.$id(searchedNodeId);

                node?.removeClass('highlight');
            }

            setSearchedNodeId(value);
        },
        [cyCore, searchedNodeId, setSearchedNodeId]
    );

    return { onSelectOption, searchOptions };
}

export default useNodeSearch;
