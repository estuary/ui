import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import { Core } from 'cytoscape';
import { useCallback, useEffect, useState } from 'react';

function useTooltip(cyCore: Core | null) {
    const setCurrentNode = useScopedSystemGraph(
        (state) => state.setCurrentNode
    );

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [anchorTriggerY, setAnchorTriggerY] = useState<string>('');
    const [anchorTriggerX, setAnchorTriggerX] = useState<string>('');

    const onNodeMouseOver = useCallback(
        (event: cytoscape.EventObject) => {
            console.log('mouseover or drag', event);

            const { cy, target } = event;

            // The shorthand for the id property cannot be used as a selector here.
            const nodeBound = cy
                .$id(target.id())
                .popperRef()
                .getBoundingClientRect();

            let anchor = document.getElementById(target.id());

            if (!anchor) {
                anchor = document.createElement('div');
                anchor.id = target.id();

                anchor.setAttribute(
                    'style',
                    `width: ${nodeBound.width}px; height: ${nodeBound.height}px; position: absolute; top: ${nodeBound.top}px; left: ${nodeBound.left}px; z-index: -1;`
                );

                document.body.appendChild(anchor);

                setCurrentNode(target.data());
            } else {
                anchor.setAttribute(
                    'style',
                    `width: ${nodeBound.width}px; height: ${nodeBound.height}px; position: absolute; top: ${nodeBound.top}px; left: ${nodeBound.left}px; z-index: -1;`
                );
            }

            setAnchorEl(anchor);
            setAnchorTriggerX(anchor.style.left);
            setAnchorTriggerY(anchor.style.top);
        },
        [setAnchorEl, setAnchorTriggerX, setAnchorTriggerY, setCurrentNode]
    );

    useEffect(() => {
        cyCore?.on('mouseover drag ', 'node', (event) =>
            onNodeMouseOver(event)
        );
    }, [cyCore, onNodeMouseOver]);

    useEffect(() => {
        cyCore?.on('mouseout', 'node', () => {
            if (anchorEl) {
                anchorEl.remove();

                setAnchorEl(null);
            }
        });
    }, [
        anchorEl,
        anchorTriggerX,
        anchorTriggerY,
        cyCore,
        setAnchorEl,
        setCurrentNode,
    ]);

    return { anchorEl };
}

export default useTooltip;
