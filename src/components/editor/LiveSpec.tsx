import { LiveSpecQuery } from 'components/capture/details';
import EditorAndList from 'components/editor/EditorAndList';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { useEffect, useState } from 'react';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    const specs = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['specs']
    >((state) => state.specs);

    const [liveSpec, setLiveSpec] = useState<LiveSpecQuery['spec'] | null>(
        null
    );

    useEffect(() => {
        if (specs) {
            setLiveSpec(specs[currentCatalog].spec);
        }
    }, [currentCatalog, specs]);

    if (liveSpec) {
        return <EditorAndList disabled={true} value={liveSpec} path="" />;
    } else {
        return null;
    }
}

export default LiveSpecEditor;
