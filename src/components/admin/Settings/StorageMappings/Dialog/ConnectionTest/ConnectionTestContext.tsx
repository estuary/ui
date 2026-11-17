import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { FragmentStore } from 'src/api/gql/storageMappings';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from 'react';

import { useStorageMappingService } from 'src/api/gql/storageMappings';
import { logRocketConsole } from 'src/services/shared';

interface BaseConnection {
    dataPlane: DataPlaneNode;
    store: FragmentStore;
    status: 'idle' | 'testing' | 'success' | 'error';
    errorMessage?: string;
}
interface InternalConnection extends BaseConnection {
    initial: boolean;
    active: boolean;
}

export interface Connection extends BaseConnection {
    orphaned: boolean;
}

export function getStoreId(store: FragmentStore): string {
    if (store.provider === 'AZURE') {
        return `AZ/${store.storageAccountName}/${store.containerName}/${store.storagePrefix ?? ''}`;
    }
    return `${store.provider}/${store.bucket}/${store.storagePrefix ?? ''}`;
}

interface ConnectionState {
    dataPlanes: DataPlaneNode[];
    stores: FragmentStore[];
    connections: InternalConnection[];
}

type ConnectionAction =
    | {
          type: 'INITIALIZE';
          dataPlanes: DataPlaneNode[];
          stores: FragmentStore[];
      }
    | { type: 'ADD_DATA_PLANE'; dataPlane: DataPlaneNode }
    | { type: 'REMOVE_DATA_PLANE'; dataPlane: DataPlaneNode }
    | { type: 'ADD_STORE'; store: FragmentStore }
    | { type: 'REMOVE_STORE'; store: FragmentStore }
    | {
          type: 'UPDATE_STATUSES';
          updates: {
              dataPlane: string;
              store: string;
              status: InternalConnection['status'];
              errorMessage?: string;
          }[];
      };

const initialState: ConnectionState = {
    dataPlanes: [],
    stores: [],
    connections: [],
};

function connectPairs(
    connections: InternalConnection[],
    pairs: { dataPlane: DataPlaneNode; store: FragmentStore }[]
): {
    allConnections: InternalConnection[];
    upsertedConnections: InternalConnection[];
} {
    const allConnections = [...connections];
    const upsertedConnections: InternalConnection[] = [];

    for (const { dataPlane, store } of pairs) {
        const idx = allConnections.findIndex(
            (c) =>
                c.dataPlane.name === dataPlane.name &&
                getStoreId(c.store) === getStoreId(store)
        );
        if (idx >= 0) {
            allConnections[idx] = { ...allConnections[idx], active: true };
            upsertedConnections.push(allConnections[idx]);
        } else {
            const conn: InternalConnection = {
                dataPlane,
                store,
                initial: false,
                active: true,
                status: 'idle',
            };
            allConnections.push(conn);
            upsertedConnections.push(conn);
        }
    }

    return { allConnections, upsertedConnections };
}

function connectionReducer(
    state: ConnectionState,
    action: ConnectionAction
): ConnectionState {
    switch (action.type) {
        case 'INITIALIZE': {
            return {
                dataPlanes: action.dataPlanes,
                stores: action.stores,
                connections: action.dataPlanes.flatMap((dp) =>
                    action.stores.map(
                        (store): InternalConnection => ({
                            dataPlane: dp,
                            store,
                            initial: true,
                            active: true,
                            status: 'idle',
                        })
                    )
                ),
            };
        }

        case 'ADD_DATA_PLANE': {
            const pairs = state.stores.map((store) => ({
                dataPlane: action.dataPlane,
                store,
            }));
            const { allConnections: connections } = connectPairs(
                state.connections,
                pairs
            );
            return {
                ...state,
                dataPlanes: [...state.dataPlanes, action.dataPlane],
                connections,
            };
        }

        case 'REMOVE_DATA_PLANE': {
            return {
                ...state,
                dataPlanes: state.dataPlanes.filter(
                    (dp) => dp.name !== action.dataPlane.name
                ),
                connections: state.connections.map((c) =>
                    c.dataPlane.name === action.dataPlane.name
                        ? { ...c, active: false }
                        : c
                ),
            };
        }

        case 'ADD_STORE': {
            const pairs = state.dataPlanes.map((dp) => ({
                dataPlane: dp,
                store: action.store,
            }));
            const { allConnections: connections } = connectPairs(
                state.connections,
                pairs
            );
            return {
                ...state,
                stores: [...state.stores, action.store],
                connections,
            };
        }

        case 'REMOVE_STORE': {
            const storeId = getStoreId(action.store);
            return {
                ...state,
                stores: state.stores.filter((s) => getStoreId(s) !== storeId),
                connections: state.connections.map((c) =>
                    getStoreId(c.store) === storeId
                        ? { ...c, active: false }
                        : c
                ),
            };
        }

        case 'UPDATE_STATUSES': {
            const updated = [...state.connections];
            for (const u of action.updates) {
                const idx = updated.findIndex(
                    (c) =>
                        c.dataPlane.name === u.dataPlane &&
                        getStoreId(c.store) === u.store
                );
                if (idx >= 0) {
                    updated[idx] = {
                        ...updated[idx],
                        status: u.status,
                        errorMessage: u.errorMessage,
                    };
                }
            }
            return { ...state, connections: updated };
        }
    }
}

interface ConnectionTestContextValue {
    catalogPrefix?: string;
    state: ConnectionState;
    dispatch: React.Dispatch<ConnectionAction>;
}

const ConnectionTestContext = createContext<ConnectionTestContextValue | null>(
    null
);

export function ConnectionTestProvider({
    catalogPrefix,
    children,
}: {
    catalogPrefix?: string;
    children: React.ReactNode;
}) {
    const [state, dispatch] = useReducer(connectionReducer, initialState);

    return (
        <ConnectionTestContext.Provider
            value={{ catalogPrefix, state, dispatch }}
        >
            {children}
        </ConnectionTestContext.Provider>
    );
}

const convertConnectionForConsumer = (c: InternalConnection): Connection =>
    ({
        dataPlane: c.dataPlane,
        store: c.store,
        status: c.status,
        errorMessage: c.errorMessage,
        orphaned: !c.active && c.initial,
    }) satisfies Connection;

export function useConnectionTest() {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }
    const { testConnection } = useStorageMappingService();
    const { catalogPrefix, state, dispatch } = context;

    const initializeEndpoints = useCallback(
        (
            newDataPlanes: DataPlaneNode[],
            newStores: FragmentStore[]
        ): Connection[] => {
            dispatch({
                type: 'INITIALIZE',
                dataPlanes: newDataPlanes,
                stores: newStores,
            });

            return newDataPlanes.flatMap((dp) =>
                newStores.map(
                    (store): Connection => ({
                        dataPlane: dp,
                        store,
                        status: 'idle',
                        orphaned: false,
                    })
                )
            );
        },
        [dispatch]
    );

    const addDataPlane = useCallback(
        (newDP: DataPlaneNode): Connection[] => {
            dispatch({ type: 'ADD_DATA_PLANE', dataPlane: newDP });
            const { upsertedConnections } = connectPairs(
                state.connections,
                state.stores.map((store) => ({ dataPlane: newDP, store }))
            );
            return upsertedConnections.map(convertConnectionForConsumer);
        },
        [state, dispatch]
    );

    const addStore = useCallback(
        (newStore: FragmentStore): Connection[] => {
            dispatch({ type: 'ADD_STORE', store: newStore });
            const { upsertedConnections } = connectPairs(
                state.connections,
                state.dataPlanes.map((dp) => ({
                    dataPlane: dp,
                    store: newStore,
                }))
            );
            return upsertedConnections.map(convertConnectionForConsumer);
        },
        [state, dispatch]
    );

    const removeDataPlane = useCallback(
        (dataPlane: DataPlaneNode) => {
            dispatch({ type: 'REMOVE_DATA_PLANE', dataPlane });
        },
        [dispatch]
    );

    const removeStore = useCallback(
        (store: FragmentStore) => {
            dispatch({ type: 'REMOVE_STORE', store });
        },
        [dispatch]
    );

    const clear = useCallback(() => {
        dispatch({ type: 'INITIALIZE', dataPlanes: [], stores: [] });
    }, [dispatch]);

    const derivedConnections = useMemo(
        () =>
            state.connections
                .filter((c) => c.active || c.initial)
                .map(convertConnectionForConsumer),
        [state.connections]
    );

    const activeConnections = useMemo(
        () => derivedConnections.filter((c) => !c.orphaned),
        [derivedConnections]
    );

    const allTestsPassing = useMemo(() => {
        return (
            activeConnections.length > 0 &&
            activeConnections.every((c) => c.status === 'success')
        );
    }, [activeConnections]);

    const isTesting = useMemo(() => {
        return activeConnections.some((c) => c.status === 'testing');
    }, [activeConnections]);

    const testConnections = useCallback(
        async (connections: Connection[]) => {
            if (!catalogPrefix) {
                throw new Error('Catalog prefix is not defined in context');
            }
            const prefix = catalogPrefix;
            if (connections.length === 0) return;

            dispatch({
                type: 'UPDATE_STATUSES',
                updates: connections.map((c) => ({
                    dataPlane: c.dataPlane.name,
                    store: getStoreId(c.store),
                    status: 'testing' as const,
                })),
            });

            try {
                const testResponse = await testConnection(
                    prefix,
                    connections.map((c) => c.dataPlane),
                    connections.map((c) => c.store)
                );

                dispatch({
                    type: 'UPDATE_STATUSES',
                    updates: testResponse
                        .filter((result) =>
                            connections.some(
                                (t) =>
                                    t.dataPlane.name === result.dataPlaneName &&
                                    getStoreId(t.store) ===
                                        getStoreId(result.fragmentStore)
                            )
                        )
                        .map((result) => ({
                            dataPlane: result.dataPlaneName,
                            store: getStoreId(result.fragmentStore),
                            status: (result.error
                                ? 'error'
                                : 'success') as InternalConnection['status'],
                            errorMessage: result.error ?? undefined,
                        })),
                });
            } catch (e) {
                logRocketConsole(
                    'StorageMapping:testConnections:error',
                    prefix,
                    e
                );

                const message =
                    e instanceof Error ? e.message : 'Connection test failed';

                dispatch({
                    type: 'UPDATE_STATUSES',
                    updates: connections.map((c) => ({
                        dataPlane: c.dataPlane.name,
                        store: getStoreId(c.store),
                        status: 'error' as const,
                        errorMessage: message,
                    })),
                });
                throw e;
            }
        },
        [catalogPrefix, dispatch, testConnection]
    );

    const testOne = useCallback(
        async (connection: Connection) => {
            try {
                await testConnections([connection]);
            } catch {
                // swallow — already reflected in UI state
            }
        },
        [testConnections]
    );

    return {
        connections: derivedConnections,
        isTesting,
        allTestsPassing,
        addDataPlane,
        addStore,
        removeDataPlane,
        removeStore,
        testConnections,
        testOne,
        initializeEndpoints,
        clear,
    };
}
