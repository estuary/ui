import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type ChangeType = 'New Entity' | 'Update';
type EntityType = 'Capture';

export interface EntityMetadata {
    changeType: ChangeType;
    entityType: EntityType;
    name: string;
    namespace: string;
    user: string;
}

export interface Entity<T = any> {
    metadata: EntityMetadata;
    schema: T;
}

// TODO: Create a distinct capture state slice that is spread into the change set store.
export interface CaptureState<T = any> {
    addCapture: (key: string, newCapture: Entity<T>) => void;
    captures: { [key: string]: Entity<T> };
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
                        }),
                        false,
                        'New Capture Added'
                    ),
                captures: {},
            }),
            { name }
        ),
        { name }
    )
);

export default useChangeSetStore;
