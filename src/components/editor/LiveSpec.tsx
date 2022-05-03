import { LiveSpecQuery } from 'components/capture/Details';
import EditorAndList from 'components/editor/EditorAndList';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    return (
        <EditorAndList
            height={450}
            disabled={true}
            value={currentCatalog ? currentCatalog.spec : {}}
            path={currentCatalog ? currentCatalog.catalog_name : ''}
        />
    );
}

export default LiveSpecEditor;
