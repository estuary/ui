import { useScopedSystemGraph } from 'components/shared/Entity/Details/Overview/Connections/Store/Store';
import { Core } from 'cytoscape';
import { SyntheticEvent, useCallback, useEffect } from 'react';

function useZoomManual(cyCore: Core | null) {
    const setZoom = useScopedSystemGraph((state) => state.setZoom);

    const onManualZoom = useCallback(
        (event: SyntheticEvent<Element, Event>, value: number) => {
            event.preventDefault();
            event.stopPropagation();

            setZoom(cyCore, value);
        },
        [cyCore, setZoom]
    );

    useEffect(() => {
        cyCore?.on('scrollzoom', () => {
            setZoom(cyCore);
        });
    }, [cyCore, setZoom]);

    return { onManualZoom };
}

export default useZoomManual;
