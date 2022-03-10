import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type EntityType = 'Capture';
type ChangeType = 'New Entity' | 'Update';

export interface EntityMetadata {
    entityType: EntityType;
    name: string;
    catalogNamespace: string;
    dateUpdated: string;
    changeType: ChangeType;
}

export interface Entity<T = any> {
    metadata: EntityMetadata;
    schema: T;
}

interface EntityDictionary<T = any> {
    [key: string]: Entity<T>;
}

// TODO: Create a distinct capture state slice that is spread into the change set store.
export interface CaptureState<T = any> {
    addCapture: (key: string, newCapture: Entity<T>) => void;
    captures: EntityDictionary;
    // TODO: Move the following properties into the overarching state.
    newChangeCount: number;
    resetNewChangeCount: () => void;
}

const name = 'change-set-state';

// TODO: Look into a better way to hydrate the state.
const useChangeSetStore = create<CaptureState>(
    devtools(
        persist(
            (set) => ({
                addCapture: (key, newCapture) =>
                    set(
                        (state) => ({
                            captures: { ...state.captures, [key]: newCapture },
                            newChangeCount: state.newChangeCount + 1,
                        }),
                        false,
                        'New Capture Added'
                    ),
                captures: {},
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
