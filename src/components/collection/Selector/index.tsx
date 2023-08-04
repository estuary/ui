import { Box } from '@mui/material';
import invariableStores from 'context/Zustand/invariableStores';
import { ReactNode } from 'react';
import { useStore } from 'zustand';
import { BindingsSelectorSkeleton } from '../CollectionSkeletons';
import CollectionSelectorActions from './Actions';
import CollectionSelectorList from './List';

interface BindingSelectorProps {
    loading: boolean;
    removeAllCollections?: () => void;

    currentCollection?: any;
    setCurrentCollection?: (collection: any) => void;

    readOnly?: boolean;
    skeleton?: ReactNode;
    RediscoverButton?: ReactNode;

    height?: number;
}

function CollectionSelector({
    loading,
    skeleton,
    readOnly,
    RediscoverButton,

    currentCollection,
    setCurrentCollection,

    height,
}: BindingSelectorProps) {
    const selected = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.selected;
        }
    );

    return loading ? (
        <Box>{skeleton ? skeleton : <BindingsSelectorSkeleton />}</Box>
    ) : (
        <>
            <CollectionSelectorActions
                readOnly={readOnly ?? selected.size === 0}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                height={height}
                currentCollection={currentCollection}
                setCurrentCollection={setCurrentCollection}
            />
        </>
    );
}

export default CollectionSelector;
