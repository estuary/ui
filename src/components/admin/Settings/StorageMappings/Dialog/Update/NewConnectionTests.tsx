import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FragmentStore } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Collapse, Link, Stack, Typography } from '@mui/material';

import { Flipped, Flipper } from 'react-flip-toolkit';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';

interface ResolvedConnection {
    key: string;
    dataPlane: DataPlaneNode;
    store: FragmentStore;
}

function resolveConnections(
    connections: ReturnType<typeof useConnectionTest>['activeConnections'],
    contextDataPlanes: DataPlaneNode[],
    contextStores: FragmentStore[]
): ResolvedConnection[] {
    const resolved: ResolvedConnection[] = [];
    for (const connection of connections) {
        const dataPlane = contextDataPlanes.find(
            (dp) => dp.dataPlaneName === connection.dataPlaneName
        );
        const store = contextStores.find(
            (s) => getStoreId(s) === connection.storeId
        );
        if (dataPlane && store) {
            resolved.push({
                key: `${connection.dataPlaneName}-${connection.storeId}`,
                dataPlane,
                store,
            });
        }
    }
    return resolved;
}

function keySet(items: ResolvedConnection[]): Set<string> {
    return new Set(items.map((item) => item.key));
}

interface RenderItem extends ResolvedConnection {
    disabled: boolean;
    isNew: boolean;
}

export function ConnectionTests() {
    const {
        activeConnections,
        orphanedOriginalConnections,
        isOriginalConnection,
        testOne,
        testConnections,
        isTesting,
        dataPlanes: contextDataPlanes,
        stores: contextStores,
    } = useConnectionTest();

    // Split into new vs existing
    const newActiveConnections = useMemo(
        () => activeConnections.filter((c) => !isOriginalConnection(c)),
        [activeConnections, isOriginalConnection]
    );
    const existingActiveConnections = useMemo(
        () => activeConnections.filter((c) => isOriginalConnection(c)),
        [activeConnections, isOriginalConnection]
    );

    // --- Resolve connections ---
    const newResolved = useMemo(
        () =>
            resolveConnections(
                newActiveConnections,
                contextDataPlanes,
                contextStores
            ),
        [newActiveConnections, contextDataPlanes, contextStores]
    );

    const existingResolved = useMemo(
        () =>
            resolveConnections(
                existingActiveConnections,
                contextDataPlanes,
                contextStores
            ),
        [existingActiveConnections, contextDataPlanes, contextStores]
    );

    // Cache endpoint objects so orphaned connections remain resolvable
    const dpCacheRef = useRef<Map<string, DataPlaneNode>>(new Map());
    const storeCacheRef = useRef<Map<string, FragmentStore>>(new Map());

    useEffect(() => {
        for (const dp of contextDataPlanes) {
            dpCacheRef.current.set(dp.dataPlaneName, dp);
        }
    }, [contextDataPlanes]);

    useEffect(() => {
        for (const store of contextStores) {
            storeCacheRef.current.set(getStoreId(store), store);
        }
    }, [contextStores]);

    const orphanedResolved = useMemo(() => {
        const entries: ResolvedConnection[] = [];
        for (const connection of orphanedOriginalConnections) {
            const dataPlane = dpCacheRef.current.get(connection.dataPlaneName);
            const store = storeCacheRef.current.get(connection.storeId);
            if (dataPlane && store) {
                entries.push({
                    key: `${connection.dataPlaneName}-${connection.storeId}`,
                    dataPlane,
                    store,
                });
            }
        }
        return entries;
    }, [orphanedOriginalConnections]);

    // --- Auto-test existing connections once after hydration ---
    const initialTestTriggered = useRef(false);
    useEffect(() => {
        if (initialTestTriggered.current) return;
        if (existingActiveConnections.length === 0) return;

        initialTestTriggered.current = true;
        void testConnections(existingActiveConnections).catch(() => {});
    }, [existingActiveConnections, testConnections]);

    // --- New connection enter/exit animations ---
    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const pendingTestsRef = useRef<ResolvedConnection[]>([]);

    const [prevNewResolved, setPrevNewResolved] =
        useState<ResolvedConnection[]>(newResolved);
    const [incomingKeys, setIncomingKeys] = useState<Set<string>>(new Set());
    const [outgoing, setOutgoing] = useState<ResolvedConnection[]>([]);
    const outgoingKeys = useMemo(() => keySet(outgoing), [outgoing]);

    // Detect new connection changes during render
    if (prevNewResolved !== newResolved) {
        setPrevNewResolved(newResolved);
        const prevKeys = keySet(prevNewResolved);
        const nextKeys = keySet(newResolved);

        const removed = prevNewResolved.filter(
            (item) => !nextKeys.has(item.key)
        );
        if (removed.length > 0) {
            setOutgoing((prev) => [...prev, ...removed]);
        }

        const added = newResolved.filter((item) => !prevKeys.has(item.key));
        if (added.length > 0) {
            setIncomingKeys(keySet(added));
            pendingTestsRef.current.push(...added);
        }
    }

    const newRenderList = useMemo(() => {
        const currentKeys = keySet(newResolved);
        return [
            ...newResolved,
            ...outgoing.filter((item) => !currentKeys.has(item.key)),
        ];
    }, [newResolved, outgoing]);

    useEffect(() => {
        if (incomingKeys.size === 0) return;
        const frame = requestAnimationFrame(() => setIncomingKeys(new Set()));
        return () => cancelAnimationFrame(frame);
    }, [incomingKeys]);

    // Auto-test newly added connections
    useEffect(() => {
        const pending = pendingTestsRef.current.splice(0);
        for (const item of pending) {
            const connection = newActiveConnections.find(
                (c) => `${c.dataPlaneName}-${c.storeId}` === item.key
            );
            if (connection && connection.status === 'idle') {
                void testOne(item.dataPlane, item.store);
            }
        }
    });

    const onExitAnimationComplete = useCallback((key: string) => {
        setOutgoing((prev) => prev.filter((item) => item.key !== key));
    }, []);

    // --- Combined render list ---
    const allRenderItems = useMemo(() => {
        const items: RenderItem[] = [];

        for (const item of existingResolved) {
            items.push({ ...item, disabled: false, isNew: false });
        }
        for (const item of orphanedResolved) {
            items.push({ ...item, disabled: true, isNew: false });
        }
        for (const item of newRenderList) {
            items.push({ ...item, disabled: false, isNew: true });
        }

        return items;
    }, [newRenderList, existingResolved, orphanedResolved]);

    const flipKey = `${allRenderItems.length}-${allRenderItems.map((item) => item.key).join(',')}`;

    const hasAnyConnections =
        activeConnections.length > 0 || orphanedOriginalConnections.length > 0;

    if (!hasAnyConnections) return null;

    return (
        <>
            <Box
                sx={{
                    ...cardHeaderSx,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography sx={cardHeaderSx}>Connection Tests</Typography>
                <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    disabled={isTesting}
                    onClick={() =>
                        void testConnections(activeConnections).catch(() => {})
                    }
                    sx={{
                        opacity: isTesting ? 0.5 : 1,
                        pointerEvents: isTesting ? 'none' : 'auto',
                    }}
                >
                    Run tests
                </Link>
            </Box>
            <Typography>
                Each data plane must be able to connect to each storage
                location. New connections must pass before saving changes.
            </Typography>
            <Flipper flipKey={flipKey}>
                <Stack spacing={1}>
                    {allRenderItems.map((item) => {
                        const animatedVisible = item.isNew
                            ? !outgoingKeys.has(item.key) &&
                              !incomingKeys.has(item.key)
                            : true;

                        return (
                            <Flipped key={item.key} flipId={item.key}>
                                <Collapse
                                    in={animatedVisible}
                                    onExited={
                                        item.isNew
                                            ? () =>
                                                  onExitAnimationComplete(
                                                      item.key
                                                  )
                                            : undefined
                                    }
                                    unmountOnExit
                                >
                                    <ConnectionAccordion
                                        dataPlane={item.dataPlane}
                                        store={item.store}
                                        expanded={
                                            item.disabled
                                                ? false
                                                : expandedKey === item.key
                                        }
                                        onToggle={
                                            item.disabled
                                                ? () => {}
                                                : (isExpanded) =>
                                                      setExpandedKey(
                                                          isExpanded
                                                              ? item.key
                                                              : null
                                                      )
                                        }
                                        disabled={item.disabled}
                                    />
                                </Collapse>
                            </Flipped>
                        );
                    })}
                </Stack>
            </Flipper>
        </>
    );
}
