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
import { stripPathing } from 'utils/misc-utils';
import CollectionSelectorSearch from './Selector/Search';
import { CollectionData } from './Selector/types';

interface Props {
    emptyListComponent?: ReactNode;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
    shortenName?: boolean;
}

function BindingSearch({
    itemType,
    shortenName,
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
        <CollectionSelectorSearch
            itemType={itemType}
            options={collectionOptions}
            readOnly={readOnly || formActive}
            selectedCollections={collectionValues}
            onChange={(value) => {
                setResourceConfig(
                    value.map(({ name }) => name),
                    undefined,
                    true
                );

                if (value.length > 0 && discoveredCollections) {
                    const latestCollection = value[value.length - 1].name;

                    if (discoveredCollections.includes(latestCollection)) {
                        setRestrictedDiscoveredCollections(latestCollection);
                    }
                }
            }}
            getValue={(option: CollectionData) =>
                shortenName ? stripPathing(option.name) : option.name
            }
            AutocompleteProps={{
                getOptionLabel: (option: CollectionData) => option.name,
                groupBy: (option: CollectionData) => option.classification,
                componentsProps: {
                    paper: {
                        sx: {
                            minWidth: 200,
                            width: '33vw',
                        },
                    },
                },
            }}
            RediscoverButton={RediscoverButton}
        />
    );
}

export default BindingSearch;
