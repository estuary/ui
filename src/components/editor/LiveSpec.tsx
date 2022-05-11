import { PubSpecQuery } from 'components/capture/Details';
import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { EditorStoreState } from 'components/editor/Store';
import { useZustandStore } from 'hooks/useZustand';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<PubSpecQuery>,
        EditorStoreState<PubSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    return (
        <EditorWithFileSelector
            disabled={true}
            value={currentCatalog ? currentCatalog.spec : {}}
            path={currentCatalog ? currentCatalog.catalog_name : ''}
        />
    );
}

export default LiveSpecEditor;
