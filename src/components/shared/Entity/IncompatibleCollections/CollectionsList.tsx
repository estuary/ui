import { useBindingsEditorStore_incompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import ChipList from 'components/shared/ChipList';

function CollectionsList() {
    const incompatibleCollections =
        useBindingsEditorStore_incompatibleCollections();

    return (
        <ChipList
            items={incompatibleCollections.map(
                (incompatibleCollection) => incompatibleCollection.collection
            )}
            keyPrefix="evolving-collections-"
        />
    );
}

export default CollectionsList;
