import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import useConstant from 'use-constant';

import CollectionSelector from 'src/components/collection/Selector';
import UpdateResourceConfigButton from 'src/components/editor/Bindings/UpdateResourceConfigButton';
import {
    useBinding_collections,
    useBinding_discoveredCollections,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

interface Props {
    emptyListComponent?: ReactNode;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function BindingSearch({
    itemType,
    readOnly = false,
    RediscoverButton,
}: Props) {
    const discoveredBindingsLabel = useConstant(() => 'Discovered Collections');
    const existingCollectionsLabel = useConstant(() => 'Existing Collections');

    const [collectionValues, setCollectionValues] = useState<string[]>([]);

    // Binding Store
    const collections = useBinding_collections();
    const discoveredCollections = useBinding_discoveredCollections();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    useEffect(() => {
        setCollectionValues(collections);
    }, [
        collections,
        discoveredCollections,
        discoveredBindingsLabel,
        existingCollectionsLabel,
    ]);

    return (
        <CollectionSelector
            itemType={itemType}
            readOnly={readOnly || formActive}
            selectedCollections={collectionValues}
            AddSelectedButton={UpdateResourceConfigButton}
            RediscoverButton={RediscoverButton}
        />
    );
}

export default BindingSearch;
