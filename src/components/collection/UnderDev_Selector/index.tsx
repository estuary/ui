import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import Hydrator from './Hydrator';

interface Props {
    collections: Set<string>;
}

function CollectionSearchAndSelector({ collections }: Props) {
    const selected = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(
        SelectTableStoreNames.COLLECTION_SELECTOR,
        selectableTableStoreSelectors.selected.get
    );

    useEffect(() => {
        console.log('selected', {
            selected: Array.from(selected),
            collections: Array.from(collections),
        });
        collections.clear();
        selected.forEach((_value, key) => {
            collections.add(key);
        });
        console.log('updated collections', {
            collections: Array.from(collections),
        });
    }, [collections, selected]);

    return <Hydrator />;
}

export default CollectionSearchAndSelector;
