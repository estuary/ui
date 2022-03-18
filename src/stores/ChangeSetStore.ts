import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
    schema: T;
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
    devtools(
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
