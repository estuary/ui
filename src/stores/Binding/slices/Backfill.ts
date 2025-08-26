import type { EvolvedCollections } from 'src/api/types';
import type { BooleanString } from 'src/components/shared/buttons/types';
import type { BindingState } from 'src/stores/Binding/types';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';
import { union } from 'lodash';

import { hasLength } from 'src/utils/misc-utils';

export type BackfillMode = 'reset' | 'incremental';

export interface StoreWithBackfill {
    // Control if backfill is allowed in the UI for a connector
    backfillSupported: boolean;
    setBackfillSupported: (val: StoreWithBackfill['backfillSupported']) => void;

    evolvedCollections: EvolvedCollections[];
    setEvolvedCollections: (value: EvolvedCollections[]) => void;

    // Controls the list of what bindings need backfilled
    backfilledBindings: string[];
    backfillAllBindings: boolean;
    setBackfilledBindings: (
        defaultBackfillValue: BackfillMode,
        increment: BooleanString,
        targetBindingUUID?: string
    ) => void;

    // Allows user to override the default and not reset collections
    backfillMode: BackfillMode | null;
    setBackfillMode: (val: BackfillMode) => void;
}

export const getInitialBackfillData = (): Pick<
    StoreWithBackfill,
    | 'backfillAllBindings'
    | 'backfillMode'
    | 'backfillSupported'
    | 'backfilledBindings'
    | 'evolvedCollections'
> => ({
    backfillAllBindings: false,
    backfillMode: null,
    backfillSupported: true,
    backfilledBindings: [],
    evolvedCollections: [],
});

export const getStoreWithBackfillSettings = (
    set: NamedSet<BindingState>
): StoreWithBackfill => ({
    ...getInitialBackfillData(),

    setBackfillMode: (newVal) => {
        set(
            {
                backfillMode: newVal,
            },
            false,
            'Binding State Reset'
        );
    },

    setBackfillSupported: (newVal) => {
        set(
            {
                backfillSupported: newVal,
            },
            false,
            'Backfill supported changed'
        );
    },

    setEvolvedCollections: (newVal) => {
        set(
            {
                evolvedCollections: newVal,
            },
            false,
            'Evolved Collections List Set'
        );
    },

    setBackfilledBindings: (
        defaultBackfillMode,
        increment,
        targetBindingUUID
    ) => {
        set(
            produce((state: BindingState) => {
                const existingBindingUUIDs = Object.keys(state.resourceConfigs);

                const bindingUUIDs = targetBindingUUID
                    ? [targetBindingUUID]
                    : existingBindingUUIDs;

                state.backfilledBindings =
                    increment === 'true'
                        ? union(state.backfilledBindings, bindingUUIDs)
                        : state.backfilledBindings.filter(
                              (uuid) => !bindingUUIDs.includes(uuid)
                          );

                state.backfillAllBindings =
                    hasLength(existingBindingUUIDs) &&
                    existingBindingUUIDs.length ===
                        state.backfilledBindings.length;

                if (state.backfilledBindings.length === 0) {
                    // If we have nothing to backfill then we can reset the setting
                    state.backfillMode = null;
                } else if (
                    increment === 'true' &&
                    state.backfillMode === null
                ) {
                    state.backfillMode = defaultBackfillMode;
                }
            }),
            false,
            'Backfilled Collections Set'
        );
    },
});
