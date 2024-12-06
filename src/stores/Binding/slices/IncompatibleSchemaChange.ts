import produce from 'immer';
import { omit } from 'lodash';
import { NamedSet } from 'zustand/middleware';
import { BindingState } from '../types';

export interface IncompatibleSchemaChangeDictionary {
    [uuid: string]: string;
}

export interface StoreWithIncompatibleSchemaChange {
    incompatibleSchemaChanges: IncompatibleSchemaChangeDictionary;
    setSingleIncompatibleSchemaChange: (
        bindingUUID: string,
        value: string | undefined
    ) => void;
}

export const getInitialIncompatibleSchemaChangeData = (): Pick<
    StoreWithIncompatibleSchemaChange,
    'incompatibleSchemaChanges'
> => ({
    incompatibleSchemaChanges: {},
});

export const getStoreWithIncompatibleSchemaChangeSettings = (
    set: NamedSet<StoreWithIncompatibleSchemaChange>
): StoreWithIncompatibleSchemaChange => ({
    ...getInitialIncompatibleSchemaChangeData(),

    setSingleIncompatibleSchemaChange: (bindingUUID, value) => {
        set(
            produce((state: BindingState) => {
                if (value) {
                    state.incompatibleSchemaChanges[bindingUUID] = value;
                } else {
                    state.incompatibleSchemaChanges = omit(
                        state.incompatibleSchemaChanges,
                        bindingUUID
                    );
                }
            }),
            false,
            'Single Incompatible Schema Change Set'
        );
    },
});
