import { Box } from '@mui/material';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { difference } from 'lodash';
import { ReactNode } from 'react';
import CollectionSelectorActions from './Actions';
import CollectionSelectorList from './List';
import CollectionSelectorSearch from './Search';

interface BindingSelectorProps {
    addCollection: (collectionName: string) => void;
    collections: Set<string>;
    loading: boolean;

    removeAllCollections: () => void;
    removeCollection: (collectionName: string) => void;

    skeleton: ReactNode;
    RediscoverButton?: ReactNode;
    currentCollection?: any;

    height?: number;
    readOnly?: boolean;

    setCurrentCollection?: (collection: any) => void;
}

function CollectionSelector({
    loading,
    skeleton,
    readOnly,
    RediscoverButton,

    collections,
    addCollection,
    removeCollection,
    removeAllCollections,

    currentCollection,
    setCurrentCollection,

    height,
}: BindingSelectorProps) {
    const { liveSpecs } = useLiveSpecs('collection');
    const catalogNames = liveSpecs.map((liveSpec) => liveSpec.catalog_name);

    const collectionsArray = Array.from(collections);

    return loading ? (
        <Box>{skeleton}</Box>
    ) : (
        <>
            <CollectionSelectorSearch
                options={catalogNames}
                readOnly={readOnly}
                selectedCollections={collectionsArray}
                onChange={(value, reason) => {
                    if (reason === 'selectOption') {
                        addCollection(difference(value, collectionsArray)[0]);
                    } else if (reason === 'removeOption') {
                        removeCollection(
                            difference(collectionsArray, value)[0]
                        );
                    }
                }}
            />

            <CollectionSelectorActions
                readOnly={readOnly ?? collections.size === 0}
                removeAllCollections={removeAllCollections}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                height={height}
                collections={collections}
                removeCollection={removeCollection}
                currentCollection={currentCollection}
                setCurrentCollection={setCurrentCollection}
            />
        </>
    );
}

export default CollectionSelector;
