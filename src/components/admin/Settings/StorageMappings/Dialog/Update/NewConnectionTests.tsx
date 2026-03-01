import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Collapse, Link, Stack, Typography } from '@mui/material';

import { Flipped, Flipper } from 'react-flip-toolkit';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    Connection,
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';
import { cardHeaderSx } from 'src/context/Theme';

const connectionKey = (connection: Connection): string =>
    `${connection.dataPlane.dataPlaneName}-${getStoreId(connection.store)}`;

export function ConnectionTests() {
    const { testOne, testConnections, isTesting, connections } =
        useConnectionTest();

    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    // --- Enter/exit animation state ---
    const isInitialLoad = useRef(true);
    const pendingTestsRef = useRef<Connection[]>([]);
    const [prevConnections, setPrevConnections] = useState(connections);
    const [entering, setEntering] = useState<Set<string>>(new Set());
    const [leaving, setLeaving] = useState<Connection[]>([]);
    const leavingKeys = useMemo(
        () => new Set(leaving.map(connectionKey)),
        [leaving]
    );

    // Detect connection list changes during render (derived state pattern)
    if (prevConnections !== connections) {
        setPrevConnections(connections);

        const prevKeys = new Set(prevConnections.map(connectionKey));
        const nextKeys = new Set(connections.map(connectionKey));

        // Connections that disappeared → animate out
        const removed = prevConnections.filter(
            (c) => !nextKeys.has(connectionKey(c))
        );
        if (removed.length > 0) {
            setLeaving((prev) => [...prev, ...removed]);
        }

        // Connections that appeared → animate in + auto-test (skip initial load)
        const added = connections.filter(
            (c) => !prevKeys.has(connectionKey(c))
        );
        if (added.length > 0 && !isInitialLoad.current) {
            setEntering(new Set(added.map(connectionKey)));
            pendingTestsRef.current.push(...added);
        }

        if (isInitialLoad.current && connections.length > 0) {
            isInitialLoad.current = false;
        }
    }

    // Merge current + leaving connections for rendering
    const renderList = useMemo(() => {
        const currentKeys = new Set(connections.map(connectionKey));
        return [
            ...connections,
            ...leaving.filter((c) => !currentKeys.has(connectionKey(c))),
        ];
    }, [connections, leaving]);

    // Clear entering flags on next animation frame to trigger expand
    useEffect(() => {
        if (entering.size === 0) return;
        const frame = requestAnimationFrame(() => setEntering(new Set()));
        return () => cancelAnimationFrame(frame);
    }, [entering]);

    // Auto-test newly added connections
    useEffect(() => {
        const pending = pendingTestsRef.current.splice(0);
        for (const c of pending) {
            if (c.status === 'idle') {
                void testOne(c);
            }
        }
    });

    const onExitComplete = useCallback((key: string) => {
        setLeaving((prev) => prev.filter((c) => connectionKey(c) !== key));
    }, []);

    const flipKey = `${renderList.length}-${renderList.map(connectionKey).join(',')}`;

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
                        void testConnections(connections).catch(() => {})
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
                <Stack spacing={1} sx={{ contain: 'inline-size' }}>
                    {renderList.map((c) => {
                        const key = connectionKey(c);
                        const isLeaving = leavingKeys.has(key);
                        const isEntering = entering.has(key);
                        const visible = !isLeaving && !isEntering;

                        return (
                            <Flipped key={key} flipId={key}>
                                <Collapse
                                    in={visible}
                                    onExited={
                                        isLeaving
                                            ? () => onExitComplete(key)
                                            : undefined
                                    }
                                    unmountOnExit
                                >
                                    <ConnectionAccordion
                                        connection={c}
                                        expanded={
                                            c.orphaned
                                                ? false
                                                : expandedKey === key
                                        }
                                        onToggle={
                                            c.orphaned
                                                ? () => {}
                                                : (isExpanded) =>
                                                      setExpandedKey(
                                                          isExpanded
                                                              ? key
                                                              : null
                                                      )
                                        }
                                        disabled={c.orphaned}
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
