import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { EditorStoreState } from 'components/editor/Store';
import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';
import { useZustandStore } from 'hooks/useZustand';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['currentCatalog']
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
