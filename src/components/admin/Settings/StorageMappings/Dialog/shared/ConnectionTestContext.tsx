import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/api/storageMappingsGql';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useStorageMappingService } from 'src/api/storageMappingsGql';

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

interface ConnectionTestContextValue {
    catalogPrefix?: string;
    dataPlanes: DataPlaneNode[];
    setDataPlanes: React.Dispatch<React.SetStateAction<DataPlaneNode[]>>;
    stores: FragmentStore[];
    setStores: React.Dispatch<React.SetStateAction<FragmentStore[]>>;
    connections: InternalConnection[];
    setConnections: React.Dispatch<React.SetStateAction<InternalConnection[]>>;
}

export function getStoreId(store: FragmentStore): string {
    if (store.provider === 'AZURE') {
        return `AZ/${store.storageAccountName}/${store.containerName}/${store.storagePrefix ?? ''}`;
    }
    return `${store.provider}/${store.bucket}/${store.storagePrefix ?? ''}`;
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
    const [dataPlanes, setDataPlanes] = useState<DataPlaneNode[]>([]);
    const [stores, setStores] = useState<FragmentStore[]>([]);
    const [connections, setConnections] = useState<InternalConnection[]>([]);

    return (
        <ConnectionTestContext.Provider
            value={{
                catalogPrefix,
                dataPlanes,
                setDataPlanes,
                stores,
                setStores,
                connections,
                setConnections,
            }}
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

export function useConnectionTest(initialEndpoints?: {
    dataPlanes: DataPlaneNode[];
    stores: FragmentStore[];
}) {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }
    const { testConnection, testSingleConnection } = useStorageMappingService();
    const {
        catalogPrefix,
        dataPlanes,
        setDataPlanes,
        stores,
        setStores,
        connections,
        setConnections,
    } = context;

    const updateConnection = useCallback(
        (
            connection: Connection,
            update: Partial<Omit<Connection, 'dataPlaneName' | 'storeId'>>
        ) => {
            setConnections((prev) => {
                const idx = prev.findIndex(
                    (c) =>
                        c.dataPlane.dataPlaneName ===
                            connection.dataPlane.dataPlaneName &&
                        getStoreId(c.store) === getStoreId(connection.store)
                );

                const updated = [...prev];

                // silently ignore updates to non-existent connections
                if (idx >= 0) {
                    updated[idx] = { ...updated[idx], ...update };
                }
                return updated;
            });
        },
        [setConnections]
    );

    const testOne = useCallback(
        async (connection: Connection) => {
            if (!catalogPrefix) {
                throw new Error('Catalog prefix is not defined in context');
            }
            const prefix = catalogPrefix;
            updateConnection(connection, {
                status: 'testing',
            });
            try {
                const result = await testSingleConnection(
                    prefix,
                    connection.dataPlane,
                    connection.store
                );
                updateConnection(connection, {
                    status: result.error ? 'error' : 'success',
                    errorMessage: result.error ?? undefined,
                });
            } catch (e) {
                // intentionally swallowing this error since it's already reflected in the UI state and we don't want to force calling code to handle it
                updateConnection(connection, {
                    status: 'error',
                    errorMessage:
                        e instanceof Error
                            ? e.message
                            : 'Connection test failed',
                });
            }
        },
        [catalogPrefix, updateConnection, testSingleConnection]
    );

    const initializeEndpoints = useCallback(
        (
            newDataPlanes: DataPlaneNode[],
            newStores: FragmentStore[]
        ): Connection[] => {
            setDataPlanes(newDataPlanes);
            setStores(newStores);

            const newConnections = newDataPlanes.flatMap((dp) =>
                newStores.map((store) => ({
                    dataPlane: dp,
                    store: store,
                    initial: true,
                    active: true,
                    status: 'idle' as const,
                }))
            );

            setConnections(newConnections);

            return newConnections.map((c) => ({
                dataPlane: c.dataPlane,
                store: c.store,
                status: c.status,
                orphaned: false,
            }));
        },
        [setDataPlanes, setStores, setConnections]
    );

    const initialized = useRef(false);
    useEffect(() => {
        if (initialized.current) return;
        if (!initialEndpoints) return;
        if (
            initialEndpoints.dataPlanes.length === 0 ||
            initialEndpoints.stores.length === 0
        )
            return;

        initialized.current = true;
        initializeEndpoints(
            initialEndpoints.dataPlanes,
            initialEndpoints.stores
        );
    }, [initialEndpoints, initializeEndpoints]);

    const addDataPlane = useCallback(
        (newDP: DataPlaneNode): Connection[] => {
            setDataPlanes((prev) => [...prev, newDP]);

            const affected: InternalConnection[] = [];
            const updated = [...connections];

            for (const store of stores) {
                const idx = updated.findIndex(
                    (c) =>
                        c.dataPlane.dataPlaneName === newDP.dataPlaneName &&
                        getStoreId(c.store) === getStoreId(store)
                );
                if (idx >= 0) {
                    updated[idx] = { ...updated[idx], active: true };
                    affected.push(updated[idx]);
                } else {
                    const conn: InternalConnection = {
                        dataPlane: newDP,
                        store,
                        initial: false,
                        active: true,
                        status: 'idle',
                    };
                    updated.push(conn);
                    affected.push(conn);
                }
            }

            setConnections(updated);
            return affected.map(convertConnectionForConsumer);
        },
        [stores, connections, setDataPlanes, setConnections]
    );

    const addStore = useCallback(
        (newStore: FragmentStore): Connection[] => {
            setStores((prev) => [...prev, newStore]);

            const affected: InternalConnection[] = [];
            const updated = [...connections];

            for (const dp of dataPlanes) {
                const idx = updated.findIndex(
                    (c) =>
                        c.dataPlane.dataPlaneName === dp.dataPlaneName &&
                        getStoreId(c.store) === getStoreId(newStore)
                );
                if (idx >= 0) {
                    updated[idx] = { ...updated[idx], active: true };
                    affected.push(updated[idx]);
                } else {
                    const conn: InternalConnection = {
                        dataPlane: dp,
                        store: newStore,
                        initial: false,
                        active: true,
                        status: 'idle',
                    };
                    updated.push(conn);
                    affected.push(conn);
                }
            }

            setConnections(updated);
            return affected.map(convertConnectionForConsumer);
        },
        [dataPlanes, connections, setStores, setConnections]
    );

    const removeDataPlane = useCallback(
        (dataPlane: DataPlaneNode) => {
            setDataPlanes((prev) =>
                prev.filter(
                    (dp: DataPlaneNode) =>
                        dp.dataPlaneName !== dataPlane.dataPlaneName
                )
            );
            setConnections((prev) =>
                prev.map((c) =>
                    c.dataPlane.dataPlaneName === dataPlane.dataPlaneName
                        ? { ...c, active: false }
                        : c
                )
            );
        },
        [setDataPlanes, setConnections]
    );

    const removeStore = useCallback(
        (store: FragmentStore) => {
            const storeId = getStoreId(store);
            setStores((prev) =>
                prev.filter((s: FragmentStore) => getStoreId(s) !== storeId)
            );
            setConnections((prev) =>
                prev.map((c) =>
                    getStoreId(c.store) === storeId
                        ? { ...c, active: false }
                        : c
                )
            );
        },
        [setStores, setConnections]
    );

    const clear = useCallback(() => {
        initializeEndpoints([], []);
    }, [initializeEndpoints]);

    const derivedConnections = useMemo(
        () =>
            connections
                .filter((c) => c.active || c.initial)
                .map(convertConnectionForConsumer),
        [connections]
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

            for (const c of connections) {
                updateConnection(c, {
                    status: 'testing',
                });
            }

            try {
                const testResponse = await testConnection(
                    prefix,
                    connections.map((c) => c.dataPlane),
                    connections.map((c) => c.store)
                );

                for (const result of testResponse) {
                    const target = connections.find(
                        (t) =>
                            t.dataPlane.dataPlaneName ===
                                result.dataPlaneName &&
                            getStoreId(t.store) ===
                                getStoreId(result.fragmentStore)
                    );
                    if (!target) continue;

                    updateConnection(target, {
                        status: result.error ? 'error' : 'success',
                        errorMessage: result.error ?? undefined,
                    });
                }
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Connection test failed';

                for (const c of connections) {
                    updateConnection(c, {
                        status: 'error',
                        errorMessage: message,
                    });
                }
                throw e;
            }
        },
        [catalogPrefix, updateConnection, testConnection]
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
