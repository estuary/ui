import { PubSpecQuery } from 'components/capture/Details';
import EditorAndList from 'components/editor/EditorAndList';
import { EditorStoreState } from 'components/editor/Store';
import { useZustandStore } from 'hooks/useZustand';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<PubSpecQuery>,
        EditorStoreState<PubSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    return (
        <EditorAndList
            disabled={true}
            value={currentCatalog ? currentCatalog.spec : {}}
            path={currentCatalog ? currentCatalog.catalog_name : ''}
        />
    );
}

export default LiveSpecEditor;
