import CollectionSelector from 'components/collection/Selector';
import { CollectionData } from 'components/collection/Selector/types';
import { ReactNode, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_discoveredCollections,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';
import UpdateResourceConfigButton from './UpdateResourceConfigButton';

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
    const discoveredCollectionsLabel = useConstant(() =>
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
    const [collectionOptions] = useState<CollectionData[]>([]);

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const collections = useResourceConfig_collections();
    const discoveredCollections = useResourceConfig_discoveredCollections();

    useEffect(() => {
        if (collections) {
            setCollectionValues(collections);
        }
    }, [
        collectionOptions,
        collections,
        discoveredCollections,
        discoveredCollectionsLabel,
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
