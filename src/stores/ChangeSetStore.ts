import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';
import { persist } from 'zustand/middleware';

type EntityType = 'Capture';
type ChangeType = 'New Entity' | 'Update';

export interface EntityMetadata {
    entityType: EntityType;
    name: string;
    catalogNamespace: string;
    dateCreated: string;
    changeType: ChangeType;
}

export interface Entity<T = any> {
    metadata: EntityMetadata;
    resources: T;
}

interface EntityDictionary<T = any> {
    [key: string]: Entity<T>;
}

export interface ChangeSetState<T = any> {
    captures: EntityDictionary;
    addCapture: (key: string, newCapture: Entity<T>) => void;
    newChangeCount: number;
    resetNewChangeCount: () => void;
}

const name = 'change-set-state';

// TODO: Look into a better way to hydrate the state.
const useChangeSetStore = create<ChangeSetState>(
    devtoolsInNonProd(
        persist(
            (set) => ({
                captures: {},
                addCapture: (key, newCapture) =>
                    set(
                        (state) => ({
                            captures: { ...state.captures, [key]: newCapture },
                            newChangeCount: state.newChangeCount + 1,
                        }),
                        false,
                        'New Capture Added'
                    ),
                newChangeCount: 0,
                resetNewChangeCount: () =>
                    set(
                        () => ({ newChangeCount: 0 }),
                        false,
                        'Change Set Viewed'
                    ),
            }),
            { name }
        ),
        { name }
    )
);

export default useChangeSetStore;
