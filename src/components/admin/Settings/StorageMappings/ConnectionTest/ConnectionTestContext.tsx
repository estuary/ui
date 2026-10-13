import type {
    StorageMappingConnection,
    StorageMappingDataPlane,
    StorageMappingFragmentStore,
} from 'src/api/gql/storageMappings';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { useTestConnectionHealth } from 'src/hooks/storageMappings/useTestConnectionHealth';

// interface TestResult {
//     dataPlaneName: string;
//     storeKey: string;
//     error?: string | null;
// }

// interface State {
//     catalogPrefix: string;
//     connections: Record<string, StorageMappingConnection>;
// }

// type Action =
//     | { type: 'TEST_START'; connectionKeys?: string[] }
//     | { type: 'TEST_END'; results: TestResult[] };

// function reducer(state: State, action: Action): State {
//     switch (action.type) {
//         case 'TEST_START': {
//             const connections = { ...state.connections };
//             const allConnectionKeys = Object.keys(connections);
//             const connectionKeys = action.connectionKeys ?? allConnectionKeys;
//             for (const key of connectionKeys) {
//                 if (Object.hasOwn(connections, key)) {
//                     connections[key].status = 'testing';
//                 }
//             }
//             return { ...state, connections };
//         }
//         case 'TEST_END': {
//             const connections = { ...state.connections };
//             console.log('connections =', connections);
//             console.log('results =', action.results);
//             for (const r of action.results) {
//                 const { dataPlaneName, storeKey, error } = r;
//                 const key = getConnectionKey(dataPlaneName, storeKey);
//                 if (Object.hasOwn(connections, key)) {
//                     connections[key].status = error ? 'error' : 'success';
//                     connections[key].error = error;
//                 }
//             }
//             return { ...state, connections };
//         }
//     }
// }

interface ConnectionTestContextValue {
    // state: State;
    // dispatch: React.Dispatch<Action>;
    catalogPrefix: string;
    connections: Record<string, StorageMappingConnection>;
    setConnections: (
        connections: Record<string, StorageMappingConnection>
    ) => void;
}

const ConnectionTestContext = createContext<ConnectionTestContextValue>({
    // state: { catalogPrefix: '', connections: {} },
    // dispatch: () => {},
    catalogPrefix: '',
    connections: {},
    setConnections: () => {},
});

interface ConnectionTestProviderProps {
    catalogPrefix?: string;
    dataPlanes?: StorageMappingDataPlane[];
    fragmentStores?: StorageMappingFragmentStore[];
    children: React.ReactNode;
}

export function ConnectionTestProvider({
    catalogPrefix = '',
    dataPlanes = [],
    fragmentStores = [],
    children,
}: ConnectionTestProviderProps) {
    const [connections, setConnections] = useState(() => {
        return getConnections(dataPlanes, fragmentStores);
    });

    // const initialState: State = useMemo(() => {
    //     const connections = getConnections(dataPlanes, fragmentStores);
    //     return { catalogPrefix, connections };
    // }, [catalogPrefix, dataPlanes, fragmentStores]);

    // const [state, dispatch] = useReducer(reducer, initialState);

    const value: ConnectionTestContextValue = useMemo(() => {
        // const connections = getConnections(dataPlanes, fragmentStores);
        return { catalogPrefix, connections, setConnections };
    }, [catalogPrefix, connections]);

    return (
        <ConnectionTestContext.Provider value={value}>
            {children}
        </ConnectionTestContext.Provider>
    );
}

export function useConnectionTestContext() {
    const ctx = useContext(ConnectionTestContext);
    const testAllConnections = useTestAllConnections();
    const testConnection = useTestConnection();

    console.log('*** ctx.connections =', ctx.connections);
    const connections = useMemo(() => {
        return Object.values(ctx.connections);
    }, [ctx.connections]);

    return { connections, testAllConnections, testConnection };
}

function useTestAllConnections() {
    const { catalogPrefix, connections } = useContext(ConnectionTestContext);
    const testConnectionHealth = useTestConnectionHealth();

    return useCallback(async () => {
        const connectionsToTest = Object.values(connections);
        // const connectionKeys = Object.keys(state.connections);
        // dispatch({ type: 'TEST_START', connectionKeys });

        const dataPlaneNames = connectionsToTest.map((c) => c.dataPlane.name);
        const fragmentStores = connectionsToTest.map((c) => c.fragmentStore);
        const results = await testConnectionHealth({
            catalogPrefix,
            dataPlaneNames,
            fragmentStores,
        });

        console.log('results =', results);
        // dispatch({ type: 'TEST_END', results });
    }, [catalogPrefix, connections, testConnectionHealth]);
}

function useTestConnection() {
    const { catalogPrefix, connections } = useContext(ConnectionTestContext);
    const testConnectionHealth = useTestConnectionHealth();

    return useCallback(
        async (connectionKey: string) => {
            if (!Object.hasOwn(connections, connectionKey)) {
                return;
            }

            // TODO: for S3 stores, get all connections using that bucket
            const connection = connections[connectionKey];
            const connectionsToTest = [connection];
            // const connectionKeys = connectionsToTest.map((c) => c.key);
            // dispatch({ type: 'TEST_START', connectionKeys });

            const dataPlaneNames = connectionsToTest.map(
                (c) => c.dataPlane.name
            );
            const fragmentStores = connectionsToTest.map(
                (c) => c.fragmentStore
            );
            const results = await testConnectionHealth({
                catalogPrefix,
                dataPlaneNames,
                fragmentStores,
            });

            console.log('results =', results);
            // dispatch({ type: 'TEST_END', results });
        },
        [catalogPrefix, connections, testConnectionHealth]
    );
}

// function getConnections(
//     mapping?: StorageMapping
// ): Record<string, StorageMappingConnection> {
//     if (!mapping) {
//         return {};
//     }

//     return Object.fromEntries(
//         mapping.dataPlanes.flatMap((dataPlane) => {
//             return mapping.fragmentStores.map((fragmentStore) => {
//                 const key = getConnectionKey(dataPlane.name, fragmentStore.key);
//                 const connection: StorageMappingConnection = {
//                     key,
//                     dataPlane,
//                     fragmentStore,
//                     status: 'idle',
//                 };

//                 return [key, connection];
//             });
//         })
//     );
// }

function getConnections(
    dataPlanes: StorageMappingDataPlane[],
    fragmentStores: StorageMappingFragmentStore[]
): Record<string, StorageMappingConnection> {
    return Object.fromEntries(
        dataPlanes.flatMap((dataPlane) => {
            return fragmentStores.map((fragmentStore) => {
                const key = getConnectionKey(dataPlane.name, fragmentStore.key);
                const connection: StorageMappingConnection = {
                    key,
                    dataPlane,
                    fragmentStore,
                    status: 'idle',
                };

                return [key, connection];
            });
        })
    );
}

function getConnectionKey(dataPlaneName: string, storeKey: string): string {
    return `${dataPlaneName}:${storeKey}`;
}
