import CollectionSelector from 'components/collection/Selector';
import { CollectionData } from 'components/collection/Selector/types';
import { ReactNode, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useResourceConfig_collections,
    useResourceConfig_discoveredCollections,
    useResourceConfig_setResourceConfig,
    useResourceConfig_setRestrictedDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import useConstant from 'use-constant';

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

    const [collectionValues, setCollectionValues] = useState<CollectionData[]>(
        []
    );
    const [collectionOptions] = useState<CollectionData[]>([]);

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const collections = useResourceConfig_collections();
    const discoveredCollections = useResourceConfig_discoveredCollections();
    const setRestrictedDiscoveredCollections =
        useResourceConfig_setRestrictedDiscoveredCollections();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    useEffect(() => {
        if (collections) {
            const values = collections.map((collection) => {
                return {
                    name: collection,
                    classification: discoveredCollections?.includes(collection)
                        ? discoveredCollectionsLabel
                        : existingCollectionsLabel,
                };
            });

            setCollectionValues(values);
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
            onChange={(value) => {
                setResourceConfig(
                    value.map(({ name }) => name),
                    undefined,
                    false,
                    true
                );

                if (value.length > 0 && discoveredCollections) {
                    const latestCollection = value[value.length - 1].name;

                    if (discoveredCollections.includes(latestCollection)) {
                        setRestrictedDiscoveredCollections(latestCollection);
                    }
                }
            }}
            RediscoverButton={RediscoverButton}
        />
    );
}

export default BindingSearch;
