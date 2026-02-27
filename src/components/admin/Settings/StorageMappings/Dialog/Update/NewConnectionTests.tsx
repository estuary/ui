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
    newActiveConnections: ReturnType<
        typeof useConnectionTest
    >['activeConnections'],
    contextDataPlanes: DataPlaneNode[],
    contextStores: FragmentStore[]
): ResolvedConnection[] {
    const resolved: ResolvedConnection[] = [];
    for (const connection of newActiveConnections) {
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

function keys(items: ResolvedConnection[]): Set<string> {
    return new Set(items.map((item) => item.key));
}

export function NewConnectionTests() {
    const {
        activeConnections,
        isOriginalConnection,
        testConnections,
        dataPlanes: contextDataPlanes,
        stores: contextStores,
    } = useConnectionTest();

    const newActiveConnections = useMemo(
        () => activeConnections.filter((c) => !isOriginalConnection(c)),
        [activeConnections, isOriginalConnection]
    );

    const currentResolved = useMemo(
        () =>
            resolveConnections(
                newActiveConnections,
                contextDataPlanes,
                contextStores
            ),
        [newActiveConnections, contextDataPlanes, contextStores]
    );

    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    // Once the card has appeared, keep it on screen even if new connections are removed
    const hasAppeared = useRef(false);
    if (newActiveConnections.length > 0) {
        hasAppeared.current = true;
    }

    const isTesting = useMemo(
        () => newActiveConnections.some((c) => c.status === 'testing'),
        [newActiveConnections]
    );

    // Track incoming/outgoing for enter/exit animations
    const [prevResolved, setPrevResolved] =
        useState<ResolvedConnection[]>(currentResolved);
    const [incomingKeys, setIncomingKeys] = useState<Set<string>>(new Set());
    const [outgoing, setOutgoing] = useState<ResolvedConnection[]>([]);
    const outgoingKeys = useMemo(() => keys(outgoing), [outgoing]);

    // Detect changes during render
    // https://react.dev/reference/react/useState#storing-information-from-previous-renders
    if (prevResolved !== currentResolved) {
        setPrevResolved(currentResolved);
        const prevKeys = keys(prevResolved);
        const nextKeys = keys(currentResolved);

        const removed = prevResolved.filter((item) => !nextKeys.has(item.key));
        if (removed.length > 0) {
            setOutgoing((prev) => [...prev, ...removed]);
        }

        const added = currentResolved.filter((item) => !prevKeys.has(item.key));
        if (added.length > 0) {
            setIncomingKeys(keys(added));
        }
    }

    const renderList = useMemo(() => {
        const currentKeys = keys(currentResolved);
        return [
            ...currentResolved,
            ...outgoing.filter((item) => !currentKeys.has(item.key)),
        ];
    }, [currentResolved, outgoing]);

    useEffect(() => {
        if (incomingKeys.size === 0) return;
        const frame = requestAnimationFrame(() => setIncomingKeys(new Set()));
        return () => cancelAnimationFrame(frame);
    }, [incomingKeys]);

    const onExitAnimationComplete = useCallback((key: string) => {
        setOutgoing((prev) => prev.filter((item) => item.key !== key));
    }, []);

    return (
        <Collapse
            in={newActiveConnections.length > 0 || hasAppeared.current}
            unmountOnExit
        >
            <CardWrapper disableMinWidth sx={{ overflow: 'hidden' }}>
                <Box
                    sx={{
                        ...cardHeaderSx,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography sx={cardHeaderSx}>New Connections</Typography>
                    {newActiveConnections.length > 0 && (
                        <Link
                            component="button"
                            variant="body2"
                            underline="hover"
                            disabled={isTesting}
                            onClick={() =>
                                void testConnections(
                                    newActiveConnections
                                ).catch(() => {})
                            }
                            sx={{
                                opacity: isTesting ? 0.5 : 1,
                                pointerEvents: isTesting ? 'none' : 'auto',
                            }}
                        >
                            Run tests
                        </Link>
                    )}
                </Box>
                <Typography>
                    New connections must pass before saving changes.
                </Typography>
                <Flipper
                    flipKey={`${renderList.length}-${renderList.map((item) => item.key).join(',')}`}
                >
                    <Stack spacing={1}>
                        <Flipped flipId="__empty">
                            <Collapse
                                in={newActiveConnections.length === 0}
                                unmountOnExit
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: 12,
                                        width: '100%',
                                        textAlign: 'center',
                                    }}
                                >
                                    (Nothing here)
                                </Typography>
                            </Collapse>
                        </Flipped>
                        {renderList.map((item) => {
                            const visible =
                                !outgoingKeys.has(item.key) &&
                                !incomingKeys.has(item.key);
                            return (
                                <Flipped key={item.key} flipId={item.key}>
                                    <Collapse
                                        in={visible}
                                        onExited={() =>
                                            onExitAnimationComplete(item.key)
                                        }
                                        unmountOnExit
                                    >
                                        <ConnectionAccordion
                                            dataPlane={item.dataPlane}
                                            store={item.store}
                                            expanded={expandedKey === item.key}
                                            onToggle={(isExpanded) =>
                                                setExpandedKey(
                                                    isExpanded ? item.key : null
                                                )
                                            }
                                        />
                                    </Collapse>
                                </Flipped>
                            );
                        })}
                    </Stack>
                </Flipper>
            </CardWrapper>
        </Collapse>
    );
}
