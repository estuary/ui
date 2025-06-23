import type { EntityRelationshipsState } from 'src/stores/EntityRelationships/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { devtoolsOptions } from 'src/utils/store-utils';

const STORE_KEY = 'entity-relationships';

const getInitialData = (): Pick<
    EntityRelationshipsState,
    'captures' | 'materializations' | 'collections'
> => ({
    captures: null,
    collections: null,
    materializations: null,
});

const getInitialStateData = () => ({
    ...getInitialData(),
    ...getInitialHydrationData(),
});

const getInitialState = (
    set: NamedSet<EntityRelationshipsState>
): EntityRelationshipsState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

    setCaptures: (captures) => {
        set(
            {
                captures,
            },
            false,
            'setCaptures'
        );
    },

    setCollections: (collections) => {
        set(
            {
                collections,
            },
            false,
            'setCollections'
        );
    },

    setMaterializations: (materializations) => {
        set(
            {
                materializations,
            },
            false,
            'setMaterializations'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'resetState');
    },
});

export const useEntityRelationshipStore = create<EntityRelationshipsState>()(
    devtools((set) => getInitialState(set), devtoolsOptions(STORE_KEY))
);
