import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/api/storageMappingsGql';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { useStorageMappingService } from 'src/api/storageMappingsGql';

export interface Connection {
    dataPlaneName: string;
    storeId: string;
    status: 'idle' | 'testing' | 'success' | 'error';
    errorMessage?: string;
}

export interface AddEndpointsOptions {
    original?: boolean;
}

interface OriginalEndpoints {
    dpNames: Set<string>;
    storeIds: Set<string>;
}

interface ConnectionTestContextValue {
    catalog_prefix?: string;
    connections: Map<string, Connection[]>;
    dataPlanes: Map<string, DataPlaneNode[]>;
    stores: Map<string, FragmentStore[]>;
    originalEndpoints: Map<string, OriginalEndpoints>;
    addEndpoints: (
        dataPlanes: DataPlaneNode[],
        stores: FragmentStore[],
        group?: string,
        options?: AddEndpointsOptions
    ) => void;
    removeDataPlane: (dataPlaneName: string, group?: string) => void;
    removeStore: (storeId: string, group?: string) => void;
    updateConnection: (
        dataPlaneName: string,
        storeId: string,
        update: Partial<Omit<Connection, 'dataPlaneName' | 'storeId'>>,
        group?: string
    ) => void;
    clearGroup: (group?: string) => void;
}

const defaultConnection: Connection = {
    dataPlaneName: '',
    storeId: '',
    status: 'idle',
};
const emptyConnections: Connection[] = [];
const emptyDataPlanes: DataPlaneNode[] = [];
const emptyStores: FragmentStore[] = [];
const emptyOriginals: OriginalEndpoints = {
    dpNames: new Set(),
    storeIds: new Set(),
};

export function getStoreId(store: FragmentStore): string {
    if (store.provider === 'AZURE') {
        return `AZURE/${store.storage_account_name}/${store.container_name}/${store.prefix ?? ''}`;
    }
    return `${store.provider}/${store.bucket}/${store.prefix ?? ''}`;
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
    const [dataPlanes, setDataPlanes] = useState<Map<string, DataPlaneNode[]>>(
        () => new Map()
    );

    const [stores, setStores] = useState<Map<string, FragmentStore[]>>(
        () => new Map()
    );

    const [connections, setConnections] = useState<Map<string, Connection[]>>(
        () => new Map()
    );

    const [originalEndpoints, setOriginalEndpoints] = useState<
        Map<string, OriginalEndpoints>
    >(() => new Map());

    const addEndpoints = useCallback(
        (
            newDataPlanes: DataPlaneNode[],
            newStores: FragmentStore[],
            group = 'default',
            options?: AddEndpointsOptions
        ) => {
            if (options?.original) {
                setOriginalEndpoints((prev) => {
                    const next = new Map(prev);
                    const existing = prev.get(group) ?? {
                        dpNames: new Set<string>(),
                        storeIds: new Set<string>(),
                    };
                    next.set(group, {
                        dpNames: new Set([
                            ...existing.dpNames,
                            ...newDataPlanes.map((dp) => dp.dataPlaneName),
                        ]),
                        storeIds: new Set([
                            ...existing.storeIds,
                            ...newStores.map((s) => getStoreId(s)),
                        ]),
                    });
                    return next;
                });
            }

            if (newDataPlanes.length > 0) {
                setDataPlanes((prev) => {
                    const next = new Map(prev);
                    const existing = prev.get(group) ?? [];
                    next.set(group, [...existing, ...newDataPlanes]);
                    return next;
                });
            }

            if (newStores.length > 0) {
                setStores((prev) => {
                    const next = new Map(prev);
                    const existing = prev.get(group) ?? [];
                    next.set(group, [...existing, ...newStores]);
                    return next;
                });
            }

            // Create connections for all new pairs:
            // newDPs × (existingStores + newStores) + existingDPs × newStores
            const existingDPs = dataPlanes.get(group) ?? [];
            const existingStores = stores.get(group) ?? [];
            const allStores = [...existingStores, ...newStores];

            const hasNewPairs =
                (newDataPlanes.length > 0 && allStores.length > 0) ||
                (existingDPs.length > 0 && newStores.length > 0);

            if (!hasNewPairs) return;

            setConnections((prev) => {
                const next = new Map(prev);
                const existing = prev.get(group) ?? [];
                const updated = [...existing];

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

                next.set(group, updated);
                return next;
            });
        },
        [dataPlanes, stores]
    );

    const removeDataPlane = useCallback(
        (dataPlaneName: string, group = 'default') => {
            setDataPlanes((prev) => {
                const existing = prev.get(group);
                if (!existing) return prev;

                const next = new Map(prev);
                next.set(
                    group,
                    existing.filter(
                        (dp: DataPlaneNode) =>
                            dp.dataPlaneName !== dataPlaneName
                    )
                );
                return next;
            });
        },
        []
    );

    const removeStore = useCallback((storeId: string, group = 'default') => {
        setStores((prev) => {
            const existing = prev.get(group);
            if (!existing) return prev;

            const next = new Map(prev);
            next.set(
                group,
                existing.filter((s: FragmentStore) => getStoreId(s) !== storeId)
            );
            return next;
        });
    }, []);

    const updateConnection = useCallback(
        (
            dataPlaneName: string,
            storeId: string,
            update: Partial<Omit<Connection, 'dataPlaneName' | 'storeId'>>,
            group = 'default'
        ) => {
            setConnections((prev) => {
                const existing = prev.get(group) ?? [];
                const idx = existing.findIndex(
                    (c) =>
                        c.dataPlaneName === dataPlaneName &&
                        c.storeId === storeId
                );

                const next = new Map(prev);
                const updated = [...existing];

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

                next.set(group, updated);
                return next;
            });
        },
        []
    );

    const clearGroup = useCallback((group = 'default') => {
        setConnections((prev) => {
            const next = new Map(prev);
            next.delete(group);
            return next;
        });
        setDataPlanes((prev) => {
            const next = new Map(prev);
            next.delete(group);
            return next;
        });
        setStores((prev) => {
            const next = new Map(prev);
            next.delete(group);
            return next;
        });
        setOriginalEndpoints((prev) => {
            const next = new Map(prev);
            next.delete(group);
            return next;
        });
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
                removeDataPlane,
                removeStore,
                updateConnection,
                clearGroup,
            }}
        >
            {children}
        </ConnectionTestContext.Provider>
    );
}

export function useConnectionTest(group?: string) {
    const context = useContext(ConnectionTestContext);
    if (!context) {
        throw new Error(
            'useConnectionTest must be used within ConnectionTestProvider'
        );
    }

    const resolvedGroup = group ?? 'default';

    const {
        catalog_prefix: catalogPrefix,
        addEndpoints: ctxAddEndpoints,
        updateConnection: ctxUpdateConnection,
        removeDataPlane: ctxRemoveDataPlane,
        removeStore: ctxRemoveStore,
        clearGroup: ctxClearGroup,
    } = context;

    const dataPlanes = useMemo(
        () => context.dataPlanes.get(resolvedGroup) ?? emptyDataPlanes,
        [context.dataPlanes, resolvedGroup]
    );

    const stores = useMemo(
        () => context.stores.get(resolvedGroup) ?? emptyStores,
        [context.stores, resolvedGroup]
    );

    const connections = useMemo(
        () => context.connections.get(resolvedGroup) ?? emptyConnections,
        [context.connections, resolvedGroup]
    );

    const originals = useMemo(
        () => context.originalEndpoints.get(resolvedGroup) ?? emptyOriginals,
        [context.originalEndpoints, resolvedGroup]
    );

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

    const addEndpoints = useCallback(
        (
            dp: DataPlaneNode[],
            s: FragmentStore[],
            options?: AddEndpointsOptions
        ) => {
            ctxAddEndpoints(dp, s, resolvedGroup, options);
        },
        [ctxAddEndpoints, resolvedGroup]
    );

    const updateConnectionStatus = useCallback(
        (
            dataPlaneName: string,
            storeId: string,
            update: Partial<Omit<Connection, 'dataPlaneName' | 'storeId'>>
        ) => {
            ctxUpdateConnection(
                dataPlaneName,
                storeId,
                update,
                resolvedGroup
            );
        },
        [ctxUpdateConnection, resolvedGroup]
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
            const targetDPNames = new Set(
                targets.map((c) => c.dataPlaneName)
            );
            const targetStoreIds = new Set(targets.map((c) => c.storeId));
            const targetDPs = dataPlanes.filter((dp) =>
                targetDPNames.has(dp.dataPlaneName)
            );
            const targetStores = stores.filter((s) =>
                targetStoreIds.has(getStoreId(s))
            );

            // Mark all targets as testing
            for (const c of targets) {
                updateConnectionStatus(c.dataPlaneName, c.storeId, {
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
                    updateConnectionStatus(
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
                    updateConnectionStatus(c.dataPlaneName, c.storeId, {
                        status: 'error',
                        errorMessage: message,
                    });
                }
                throw e;
            }
        },
        [
            catalogPrefix,
            dataPlanes,
            stores,
            updateConnectionStatus,
            testConnection,
        ]
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
            updateConnectionStatus(dataPlane.dataPlaneName, storeId, {
                status: 'testing',
            });
            try {
                const result = await testSingleConnection(
                    prefix,
                    dataPlane,
                    store
                );
                updateConnectionStatus(dataPlane.dataPlaneName, storeId, {
                    status: result.error ? 'error' : 'success',
                    errorMessage: result.error ?? undefined,
                });
            } catch (e) {
                // intentionally swallowing this error since it's already reflected in the UI state and we don't want to force calling code to handle it
                updateConnectionStatus(dataPlane.dataPlaneName, storeId, {
                    status: 'error',
                    errorMessage:
                        e instanceof Error
                            ? e.message
                            : 'Connection test failed',
                });
            }
        },
        [catalogPrefix, updateConnectionStatus, testSingleConnection]
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
                    !nextDPs.some(
                        (dp) => dp.dataPlaneName === p.dataPlaneName
                    )
            );

            const addedStores = nextStores.filter(
                (s) =>
                    !stores.some(
                        (p) => getStoreId(p) === getStoreId(s)
                    )
            );
            const removedStores = stores.filter(
                (p) =>
                    !nextStores.some(
                        (s) => getStoreId(s) === getStoreId(p)
                    )
            );

            if (addedDPs.length > 0 || addedStores.length > 0) {
                ctxAddEndpoints(addedDPs, addedStores, resolvedGroup);
            }
            for (const dp of removedDPs) {
                ctxRemoveDataPlane(dp.dataPlaneName, resolvedGroup);
            }
            for (const store of removedStores) {
                ctxRemoveStore(getStoreId(store), resolvedGroup);
            }
        },
        [
            dataPlanes,
            stores,
            ctxAddEndpoints,
            ctxRemoveDataPlane,
            ctxRemoveStore,
            resolvedGroup,
        ]
    );

    const clear = useCallback(() => {
        ctxClearGroup(resolvedGroup);
    }, [ctxClearGroup, resolvedGroup]);

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
