import { LiveSpecQuery } from 'components/capture/details';
import EditorAndList from 'components/editor/EditorAndList';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    return <EditorAndList disabled={true} value={currentCatalog} path="" />;
}

export default LiveSpecEditor;
