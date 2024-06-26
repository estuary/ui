import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import { eChartsColors } from 'context/Theme';
import { CSSProperties, SyntheticEvent, useCallback, useMemo } from 'react';
import { useReactFlow } from 'reactflow';

export interface Options {
    [id: string]: string;
}

function useNodeSearch() {
    const { setCenter } = useReactFlow();

    const nodes = useScopedSystemGraph((state) => state.nodes);

    const searchOptions = useMemo(() => {
        const options: Options = {};

        nodes.forEach(({ id, data: { label } }) => {
            options[id] = label;
        });

        return options;
    }, [nodes]);

    const setSearchedNodeId = useScopedSystemGraph(
        (state) => state.setSearchedNodeId
    );
    const setNodeStyle = useScopedSystemGraph((state) => state.setNodeStyle);

    const onSelectOption = useCallback(
        (event: SyntheticEvent<Element, Event>, value: string | null) => {
            event.preventDefault();
            event.stopPropagation();

            let nodeStyle: CSSProperties | undefined;

            if (value) {
                const selectedNode = nodes
                    .filter((node) => node.id === value)
                    .at(0);

                if (selectedNode) {
                    const x =
                        selectedNode.position.x + (selectedNode.width ?? 0) / 2;

                    const y =
                        selectedNode.position.y +
                        (selectedNode.height ?? 0) / 2;

                    const zoom = 1.85;

                    setCenter(x, y, { zoom, duration: 1000 });
                    nodeStyle = {
                        borderColor: eChartsColors.medium[0],
                        boxShadow: `0 0 0 0.5px ${eChartsColors.medium[0]}`,
                    };
                }
            }

            setSearchedNodeId(value);
            setNodeStyle(nodeStyle);
        },
        [nodes, setCenter, setNodeStyle, setSearchedNodeId]
    );

    return { onSelectOption, searchOptions };
}

export default useNodeSearch;
