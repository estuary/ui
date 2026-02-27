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

export interface Connection {
    dataPlaneName: string;
    storeId: string;
    initial: boolean;
    active: boolean;
    status: 'idle' | 'testing' | 'success' | 'error';
    errorMessage?: string;
}

interface InitialEndpoints {
    dpNames: Set<string>;
    storeIds: Set<string>;
}

interface ConnectionTestContextValue {
    catalog_prefix?: string;
    dataPlanes: DataPlaneNode[];
    setDataPlanes: React.Dispatch<React.SetStateAction<DataPlaneNode[]>>;
    stores: FragmentStore[];
    setStores: React.Dispatch<React.SetStateAction<FragmentStore[]>>;
    connections: Connection[];
    setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
    originalEndpoints: InitialEndpoints;
    setOriginalEndpoints: React.Dispatch<
        React.SetStateAction<InitialEndpoints>
    >;
}

const defaultConnection: Connection = {
    dataPlaneName: '',
    storeId: '',
    initial: false,
    active: false,
    status: 'idle',
};
const emptyOriginals: InitialEndpoints = {
    dpNames: new Set(),
    storeIds: new Set(),
};

export function getStoreId(store: FragmentStore): string {
    if (store.provider === 'AZURE') {
        return `AZ/${store.storage_account_name}/${store.container_name}/${store.storage_prefix ?? ''}`;
    }
    return `${store.provider}/${store.bucket}/${store.storage_prefix ?? ''}`;
}

const ConnectionTestContext = createContext<ConnectionTestContextValue | null>(
    null
);

export function ConnectionTestProvider({
    catalog_prefix,
    children,
}: {
    catalog_prefix?: string;
    children: React.ReactNode;
}) {
    const [dataPlanes, setDataPlanes] = useState<DataPlaneNode[]>([]);
    const [stores, setStores] = useState<FragmentStore[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [originalEndpoints, setOriginalEndpoints] =
        useState<InitialEndpoints>(emptyOriginals);

    return (
        <ConnectionTestContext.Provider
            value={{
                catalog_prefix,
                dataPlanes,
                setDataPlanes,
                stores,
                setStores,
                connections,
                setConnections,
                originalEndpoints,
                setOriginalEndpoints,
            }}
        >
            {children}
        </ConnectionTestContext.Provider>
    );
}

function restoreOrAdd(
    prev: Connection[],
    pairs: { dataPlaneName: string; storeId: string }[]
): Connection[] {
    const updated = [...prev];
    for (const { dataPlaneName, storeId } of pairs) {
        const idx = updated.findIndex(
            (c) => c.dataPlaneName === dataPlaneName && c.storeId === storeId
        );
        if (idx >= 0) {
            updated[idx] = { ...updated[idx], active: true };
        } else {
            updated.push({
                dataPlaneName,
                storeId,
                initial: false,
                active: true,
                status: 'idle',
            });
        }
    }
    return updated;
}

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

    const {
        catalog_prefix: catalogPrefix,
        dataPlanes,
        setDataPlanes,
        stores,
        setStores,
        connections,
        setConnections,
        setOriginalEndpoints,
    } = context;

    // --- Mutations ---

    const initializeEndpoints = useCallback(
        (newDataPlanes: DataPlaneNode[], newStores: FragmentStore[]) => {
            setOriginalEndpoints({
                dpNames: new Set(newDataPlanes.map((dp) => dp.dataPlaneName)),
                storeIds: new Set(newStores.map((s) => getStoreId(s))),
            });

            setDataPlanes(newDataPlanes);
            setStores(newStores);
            setConnections(
                newDataPlanes.flatMap((dp) =>
                    newStores.map((store) => ({
                        dataPlaneName: dp.dataPlaneName,
                        storeId: getStoreId(store),
                        initial: true,
                        active: true,
                        orphaned: false,
                        status: 'idle' as const,
                    }))
                )
            );
        },
        []
    );

    const addDataPlane = useCallback(
        (newDP: DataPlaneNode) => {
            setDataPlanes((prev) => [...prev, newDP]);
            setConnections((existingConnections) =>
                restoreOrAdd(
                    existingConnections,
                    stores.map((store) => ({
                        dataPlaneName: newDP.dataPlaneName,
                        storeId: getStoreId(store),
                    }))
                )
            );
        },
        [stores]
    );

    const addStore = useCallback(
        (newStore: FragmentStore) => {
            setStores((prev) => [...prev, newStore]);
            const storeId = getStoreId(newStore);
            setConnections((existingConnections) =>
                restoreOrAdd(
                    existingConnections,
                    dataPlanes.map((dp) => ({
                        dataPlaneName: dp.dataPlaneName,
                        storeId,
                    }))
                )
            );
        },
        [dataPlanes]
    );

    const removeDataPlane = useCallback((dataPlaneName: string) => {
        setDataPlanes((prev) =>
            prev.filter(
                (dp: DataPlaneNode) => dp.dataPlaneName !== dataPlaneName
            )
        );
        setConnections((prev) =>
            prev.map((c) =>
                c.dataPlaneName === dataPlaneName ? { ...c, active: false } : c
            )
        );
    }, []);

    const removeStore = useCallback((storeId: string) => {
        setStores((prev) =>
            prev.filter((s: FragmentStore) => getStoreId(s) !== storeId)
        );
        setConnections((prev) =>
            prev.map((c) =>
                c.storeId === storeId ? { ...c, active: false } : c
            )
        );
    }, []);

    const updateConnection = useCallback(
        (
            dataPlaneName: string,
            storeId: string,
            update: Partial<Omit<Connection, 'dataPlaneName' | 'storeId'>>
        ) => {
            setConnections((prev) => {
                const idx = prev.findIndex(
                    (c) =>
                        c.dataPlaneName === dataPlaneName &&
                        c.storeId === storeId
                );

                const updated = [...prev];

                // silently ignore updates to non-existent connections
                if (idx >= 0) {
                    updated[idx] = { ...updated[idx], ...update };
                }
                return updated;
            });
        },
        []
    );

    const clear = useCallback(() => {
        initializeEndpoints([], []);
        initialized.current = false;
    }, [initializeEndpoints]);

    // run once when the hook is invoked with initial endpoints to set up the context state
    const initialized = useRef(false);
    useEffect(() => {
        if (initialized.current || !initialEndpoints?.dataPlanes.length) return;

        initialized.current = true;
        initializeEndpoints(
            initialEndpoints.dataPlanes,
            initialEndpoints.stores
        );
    }, [initialEndpoints, initializeEndpoints]);

    // --- Derived state ---

    const derivedConnections = useMemo(
        () =>
            connections
                .filter((c) => c.active || c.initial)
                .map((c) => ({
                    dataPlaneName: c.dataPlaneName,
                    storeId: c.storeId,
                    status: c.status,
                    errorMessage: c.errorMessage,
                    orphaned: !c.active && c.initial,
                })),
        [connections]
    );

    const { testConnection, testSingleConnection } = useStorageMappingService();

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

    // --- Testing ---

    const testConnections = useCallback(
        async (targets: Pick<Connection, 'dataPlaneName' | 'storeId'>[]) => {
            if (!catalogPrefix) {
                throw new Error('Catalog prefix is not defined in context');
            }
            const prefix = catalogPrefix;
            if (targets.length === 0) return;

            // Extract unique DPs and stores from targets
            const targetDPNames = new Set(targets.map((c) => c.dataPlaneName));
            const targetStoreIds = new Set(targets.map((c) => c.storeId));
            const targetDPs = dataPlanes.filter((dp) =>
                targetDPNames.has(dp.dataPlaneName)
            );
            const targetStores = stores.filter((s) =>
                targetStoreIds.has(getStoreId(s))
            );

            // Mark all targets as testing
            for (const c of targets) {
                updateConnection(c.dataPlaneName, c.storeId, {
                    status: 'testing',
                });
            }

            try {
                const testResponse = await testConnection(
                    prefix,
                    targetDPs,
                    targetStores
                );

                for (const result of testResponse) {
                    updateConnection(
                        result.dataPlaneName,
                        getStoreId(result.fragmentStore),
                        {
                            status: result.error ? 'error' : 'success',
                            errorMessage: result.error ?? undefined,
                        }
                    );
                }
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Connection test failed';

                for (const c of targets) {
                    updateConnection(c.dataPlaneName, c.storeId, {
                        status: 'error',
                        errorMessage: message,
                    });
                }
                throw e;
            }
        },
        [catalogPrefix, dataPlanes, stores, updateConnection, testConnection]
    );

    const testAll = useCallback(async () => {
        await testConnections(activeConnections);
    }, [testConnections, activeConnections]);

    const testOne = useCallback(
        async (dataPlane: DataPlaneNode, store: FragmentStore) => {
            if (!catalogPrefix) {
                throw new Error('Catalog prefix is not defined in context');
            }
            const prefix = catalogPrefix;

            const storeId = getStoreId(store);
            updateConnection(dataPlane.dataPlaneName, storeId, {
                status: 'testing',
            });
            try {
                const result = await testSingleConnection(
                    prefix,
                    dataPlane,
                    store
                );
                updateConnection(dataPlane.dataPlaneName, storeId, {
                    status: result.error ? 'error' : 'success',
                    errorMessage: result.error ?? undefined,
                });
            } catch (e) {
                // intentionally swallowing this error since it's already reflected in the UI state and we don't want to force calling code to handle it
                updateConnection(dataPlane.dataPlaneName, storeId, {
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

    function connectionFor(
        dataPlane: DataPlaneNode,
        store: FragmentStore
    ): Connection {
        const storeId = getStoreId(store);
        return (
            connections.find(
                (c) =>
                    c.dataPlaneName === dataPlane.dataPlaneName &&
                    c.storeId === storeId
            ) ?? {
                ...defaultConnection,
                dataPlaneName: dataPlane.dataPlaneName,
                storeId,
            }
        );
    }

    return {
        connections: derivedConnections,
        isTesting,
        allTestsPassing,
        addDataPlane,
        addStore,
        removeDataPlane,
        removeStore,
        testOne,
        testAll,
        connectionFor,
        clear,
    };
}
