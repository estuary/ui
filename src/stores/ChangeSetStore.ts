import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type ChangeType = 'New Entity' | 'Update';
type EntityType = 'Capture';

export interface EntityMetadata {
    changeType: ChangeType;
    entityType: EntityType;
    name: string;
    catalogNamespace: string;
    user: string;
}

export interface Entity<T = any> {
    metadata: EntityMetadata;
    schema: T;
    viewed: boolean;
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
    updateViewStatus: () => void;
}

/*
const countNewChanges = (changeSet: EntityDictionary) =>
    Object.values(changeSet).filter((entity: Entity) => !entity.viewed).length;
    */

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
                updateViewStatus: () =>
                    set(
                        (state) => {
                            const outdatedEntityInfo: [string, Entity<any>][] =
                                Object.entries(state.captures).filter(
                                    ([_, entity]) => !entity.viewed
                                );

                            const updatedEntityInfo: [string, Entity<any>][] =
                                outdatedEntityInfo.map(([key, entity]) => {
                                    entity.viewed = true;

                                    return [key, entity];
                                });

                            return {
                                captures: Object.assign(
                                    state.captures,
                                    ...updatedEntityInfo.map(
                                        ([key, entity]) => ({
                                            [key]: entity,
                                        })
                                    )
                                ),
                                newChangeCount: 0,
                            };
                        },
                        false,
                        'Entity View Status Updated'
                    ),
            }),
            { name }
        ),
        { name }
    )
);

export default useChangeSetStore;
