import type { EntityRelationshipsState } from 'src/stores/EntityRelationships/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { devtoolsOptions } from 'src/utils/store-utils';

const STORE_KEY = 'entity-relationships';

const getInitialData = (): Pick<
    EntityRelationshipsState,
    'captures' | 'materializations'
> => ({
    captures: null,
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

    setCaptures: (newVal) => {
        set(
            produce((state: EntityRelationshipsState) => {
                state.captures = newVal;
            }),
            false,
            'setCaptures'
        );
    },

    setMaterializations: (newVal) => {
        set(
            produce((state: EntityRelationshipsState) => {
                state.materializations = newVal;
            }),
            false,
            'setCaptures'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'resetState');
    },
});

export const useEntityRelationshipStore = create<EntityRelationshipsState>()(
    devtools((set) => getInitialState(set), devtoolsOptions(STORE_KEY))
);
