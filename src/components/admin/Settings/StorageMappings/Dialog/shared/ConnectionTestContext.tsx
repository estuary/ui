import type { DataPlaneNode } from 'src/api/gql/dataPlanes';
import type { FragmentStore } from 'src/api/gql/storageMappings';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { useStorageMappingService } from 'src/api/gql/storageMappings';

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

export function useConnectionTest() {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }
    const { testConnection } = useStorageMappingService();
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
            update: Partial<Pick<Connection, 'status' | 'errorMessage'>>
        ) => {
            setConnections((prev) => {
                const idx = prev.findIndex(
                    (c) =>
                        c.dataPlane.name === connection.dataPlane.name &&
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
                    store,
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

    const connectEndpoints = useCallback(
        (
            pairs: { dataPlane: DataPlaneNode; store: FragmentStore }[]
        ): Connection[] => {
            const affected: InternalConnection[] = [];
            const updated = [...connections];

            for (const { dataPlane, store } of pairs) {
                const idx = updated.findIndex(
                    (c) =>
                        c.dataPlane.name === dataPlane.name &&
                        getStoreId(c.store) === getStoreId(store)
                );
                if (idx >= 0) {
                    updated[idx] = { ...updated[idx], active: true };
                    affected.push(updated[idx]);
                } else {
                    const conn: InternalConnection = {
                        dataPlane,
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
        [connections, setConnections]
    );

    const addDataPlane = useCallback(
        (newDP: DataPlaneNode): Connection[] => {
            setDataPlanes((prev) => [...prev, newDP]);
            return connectEndpoints(
                stores.map((store) => ({ dataPlane: newDP, store }))
            );
        },
        [stores, setDataPlanes, connectEndpoints]
    );

    const addStore = useCallback(
        (newStore: FragmentStore): Connection[] => {
            setStores((prev) => [...prev, newStore]);
            return connectEndpoints(
                dataPlanes.map((dp) => ({ dataPlane: dp, store: newStore }))
            );
        },
        [dataPlanes, setStores, connectEndpoints]
    );

    const removeDataPlane = useCallback(
        (dataPlane: DataPlaneNode) => {
            setDataPlanes((prev) =>
                prev.filter((dp: DataPlaneNode) => dp.name !== dataPlane.name)
            );
            setConnections((prev) =>
                prev.map((c) =>
                    c.dataPlane.name === dataPlane.name
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
                            t.dataPlane.name === result.dataPlaneName &&
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
