import { ReactNode, useEffect, useState } from 'react';
import useConstant from 'use-constant';

import UpdateResourceConfigButton from './UpdateResourceConfigButton';
import { useIntl } from 'react-intl';

import CollectionSelector from 'src/components/collection/Selector';
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
    const intl = useIntl();
    const discoveredBindingsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.discoveredCollections',
        })
    );
    const existingCollectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'workflows.collectionSelector.label.existingCollections',
        })
    );

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
