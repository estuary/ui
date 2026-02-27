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
    status: 'idle' | 'testing' | 'success' | 'error';
    errorMessage?: string;
}

interface OriginalEndpoints {
    dpNames: Set<string>;
    storeIds: Set<string>;
}

interface ConnectionTestContextValue {
    catalog_prefix?: string;
    connections: Connection[];
    dataPlanes: DataPlaneNode[];
    stores: FragmentStore[];
    originalEndpoints: OriginalEndpoints;
    addEndpoints: (
        dataPlanes: DataPlaneNode[],
        stores: FragmentStore[]
    ) => void;
    initializeEndpoints: (
        dataPlanes: DataPlaneNode[],
        stores: FragmentStore[]
    ) => void;
    removeDataPlane: (dataPlaneName: string) => void;
    removeStore: (storeId: string) => void;
    updateConnection: (
        dataPlaneName: string,
        storeId: string,
        update: Partial<Omit<Connection, 'dataPlaneName' | 'storeId'>>
    ) => void;
    clear: () => void;
}

const defaultConnection: Connection = {
    dataPlaneName: '',
    storeId: '',
    status: 'idle',
};
const emptyOriginals: OriginalEndpoints = {
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

    // Original endpoints are tracked separately because the update flow
    // needs to remember which endpoints were there when the user opened
    // the dialog in order to indicate which connections will be broken
    // when the user deletes an endpoint
    const [originalEndpoints, setOriginalEndpoints] =
        useState<OriginalEndpoints>(emptyOriginals);

    const initializeEndpoints = useCallback(
        (dataPlanes: DataPlaneNode[], stores: FragmentStore[]) => {
            setOriginalEndpoints({
                dpNames: new Set(dataPlanes.map((dp) => dp.dataPlaneName)),
                storeIds: new Set(stores.map((s) => getStoreId(s))),
            });
        },
        []
    );

    const addEndpoints = useCallback(
        (newDataPlanes: DataPlaneNode[], newStores: FragmentStore[]) => {
            if (newDataPlanes.length > 0) {
                setDataPlanes((prev) => [...prev, ...newDataPlanes]);
            }

            if (newStores.length > 0) {
                setStores((prev) => [...prev, ...newStores]);
            }

            // Create connections for all new pairs:
            // newDPs × (existingStores + newStores) + existingDPs × newStores
            const existingDPs = dataPlanes;
            const existingStores = stores;
            const allStores = [...existingStores, ...newStores];

            const hasNewPairs =
                (newDataPlanes.length > 0 && allStores.length > 0) ||
                (existingDPs.length > 0 && newStores.length > 0);

            if (!hasNewPairs) return;

            setConnections((prev) => {
                const updated = [...prev];

                const upsert = (dpName: string, storeId: string) => {
                    const exists = updated.some(
                        (c) =>
                            c.dataPlaneName === dpName && c.storeId === storeId
                    );
                    if (!exists) {
                        updated.push({
                            dataPlaneName: dpName,
                            storeId,
                            status: 'idle',
                        });
                    }
                    // If already exists, leave it alone (status preserved)
                };

                // newDPs × all stores
                for (const dp of newDataPlanes) {
                    for (const store of allStores) {
                        upsert(dp.dataPlaneName, getStoreId(store));
                    }
                }

                // existingDPs × newStores only
                for (const dp of existingDPs) {
                    for (const store of newStores) {
                        upsert(dp.dataPlaneName, getStoreId(store));
                    }
                }

                return updated;
            });
        },
        [dataPlanes, stores]
    );

    const removeDataPlane = useCallback((dataPlaneName: string) => {
        setDataPlanes((prev) =>
            prev.filter(
                (dp: DataPlaneNode) => dp.dataPlaneName !== dataPlaneName
            )
        );
    }, []);

    const removeStore = useCallback((storeId: string) => {
        setStores((prev) =>
            prev.filter((s: FragmentStore) => getStoreId(s) !== storeId)
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

                if (idx >= 0) {
                    updated[idx] = { ...updated[idx], ...update };
                } else {
                    updated.push({
                        dataPlaneName,
                        storeId,
                        status: 'idle',
                        ...update,
                    });
                }

                return updated;
            });
        },
        []
    );

    const clear = useCallback(() => {
        setConnections([]);
        setDataPlanes([]);
        setStores([]);
        setOriginalEndpoints(emptyOriginals);
    }, []);

    return (
        <ConnectionTestContext.Provider
            value={{
                catalog_prefix,
                connections,
                dataPlanes,
                stores,
                originalEndpoints,
                addEndpoints,
                initializeEndpoints,
                removeDataPlane,
                removeStore,
                updateConnection,
                clear,
            }}
        >
            {children}
        </ConnectionTestContext.Provider>
    );
}

interface UseConnectionTestOriginals {
    dataPlanes: DataPlaneNode[];
    stores: FragmentStore[];
}

export function useConnectionTest(
    initialOriginals?: UseConnectionTestOriginals
) {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }

    const {
        catalog_prefix: catalogPrefix,
        connections,
        dataPlanes,
        stores,
        originalEndpoints: originals,
        addEndpoints,
        initializeEndpoints,
        updateConnection,
        removeDataPlane,
        removeStore,
        clear: ctxClear,
    } = context;

    // Register original endpoints once when provided. Anything added
    // via addEndpoints after this point is considered "new".
    const originalsRegistered = useRef(false);
    useEffect(() => {
        if (originalsRegistered.current || !initialOriginals?.dataPlanes.length)
            return;

        originalsRegistered.current = true;
        initializeEndpoints(
            initialOriginals.dataPlanes,
            initialOriginals.stores
        );
        addEndpoints(initialOriginals.dataPlanes, initialOriginals.stores);
    }, [initialOriginals, initializeEndpoints, addEndpoints]);

    // Derived: connections where both endpoints are currently in the maps
    const activeDPNames = useMemo(
        () => new Set(dataPlanes.map((dp) => dp.dataPlaneName)),
        [dataPlanes]
    );
    const activeStoreIds = useMemo(
        () => new Set(stores.map((s) => getStoreId(s))),
        [stores]
    );

    const activeConnections = useMemo(
        () =>
            connections.filter(
                (c) =>
                    activeDPNames.has(c.dataPlaneName) &&
                    activeStoreIds.has(c.storeId)
            ),
        [connections, activeDPNames, activeStoreIds]
    );

    // Derived: connections where at least one endpoint is missing AND both were original
    const orphanedOriginalConnections = useMemo(
        () =>
            connections.filter((c) => {
                const isOrphaned =
                    !activeDPNames.has(c.dataPlaneName) ||
                    !activeStoreIds.has(c.storeId);
                const bothOriginal =
                    originals.dpNames.has(c.dataPlaneName) &&
                    originals.storeIds.has(c.storeId);
                return isOrphaned && bothOriginal;
            }),
        [connections, activeDPNames, activeStoreIds, originals]
    );

    // Helper: were both endpoints in this connection originally present?
    const isOriginalConnection = useCallback(
        (c: Connection): boolean =>
            originals.dpNames.has(c.dataPlaneName) &&
            originals.storeIds.has(c.storeId),
        [originals]
    );

    const { testConnection, testSingleConnection } = useStorageMappingService();

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
        async (targets: Connection[]) => {
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

    const syncEndpoints = useCallback(
        (nextDPs: DataPlaneNode[], nextStores: FragmentStore[]) => {
            const addedDPs = nextDPs.filter(
                (dp) =>
                    !dataPlanes.some(
                        (p) => p.dataPlaneName === dp.dataPlaneName
                    )
            );
            const removedDPs = dataPlanes.filter(
                (p) =>
                    !nextDPs.some((dp) => dp.dataPlaneName === p.dataPlaneName)
            );

            const addedStores = nextStores.filter(
                (s) => !stores.some((p) => getStoreId(p) === getStoreId(s))
            );
            const removedStores = stores.filter(
                (p) => !nextStores.some((s) => getStoreId(s) === getStoreId(p))
            );

            if (addedDPs.length > 0 || addedStores.length > 0) {
                addEndpoints(addedDPs, addedStores);
            }
            for (const dp of removedDPs) {
                removeDataPlane(dp.dataPlaneName);
            }
            for (const store of removedStores) {
                removeStore(getStoreId(store));
            }
        },
        [dataPlanes, stores, addEndpoints, removeDataPlane, removeStore]
    );

    const clear = useCallback(() => {
        ctxClear();
        originalsRegistered.current = false;
    }, [ctxClear]);

    return {
        dataPlanes,
        stores,
        connections,
        activeConnections,
        orphanedOriginalConnections,
        isOriginalConnection,
        addEndpoints,
        syncEndpoints,
        isTesting,
        allTestsPassing,
        testOne,
        testAll,
        testConnections,
        connectionFor,
        clear,
    };
}
