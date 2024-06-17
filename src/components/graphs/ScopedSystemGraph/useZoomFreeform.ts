import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import { Core } from 'cytoscape';
import { SyntheticEvent, useCallback } from 'react';

function useZoomFreeform(cyCore: Core | null) {
    const setUserZoomingEnabled = useScopedSystemGraph(
        (state) => state.setUserZoomingEnabled
    );

    const onFreeformZoom = useCallback(
        (event: SyntheticEvent<Element, Event>, checked: boolean) => {
            event.preventDefault();
            event.stopPropagation();

            setUserZoomingEnabled(cyCore, checked);
        },
        [cyCore, setUserZoomingEnabled]
    );

    return { onFreeformZoom };
}

export default useZoomFreeform;
