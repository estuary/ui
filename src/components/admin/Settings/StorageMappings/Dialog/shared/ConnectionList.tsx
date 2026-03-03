import type { Connection } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Collapse, Stack } from '@mui/material';

import { Flipped, Flipper } from 'react-flip-toolkit';

import { ConnectionAccordion } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionAccordion';
import {
    getStoreId,
    useConnectionTest,
} from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ConnectionTestContext';

const connectionKey = (connection: Connection): string =>
    `${connection.dataPlane.name}-${getStoreId(connection.store)}`;

export function ConnectionList({ autoTest = false }: { autoTest?: boolean }) {
    const { testOne, connections } = useConnectionTest();

    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    // --- Enter/exit animation state ---
    const isInitialLoad = useRef(true);
    const autoTestQueue = useRef<Connection[]>([]);
    const [prevConnections, setPrevConnections] = useState(connections);
    const [incomingKeys, setIncomingKeys] = useState<Set<string>>(new Set());
    const [outgoingConnections, setOutgoingConnections] = useState<
        Connection[]
    >([]);

    // Detect connection list changes during render (derived state pattern)
    if (prevConnections !== connections) {
        setPrevConnections(connections);

        const prevKeys = new Set(prevConnections.map(connectionKey));
        const nextKeys = new Set(connections.map(connectionKey));

        const removed = prevConnections.filter(
            (c) => !nextKeys.has(connectionKey(c))
        );
        if (removed.length > 0) {
            // these will be animated out and then cleared
            setOutgoingConnections((prev) => [...prev, ...removed]);
        }

        const added = connections.filter(
            (c) => !prevKeys.has(connectionKey(c))
        );

        // initial load flag prevents weird animation when the list first appears
        if (added.length > 0 && !isInitialLoad.current) {
            // these will be animated in - storing the keys so we know when the animation is done
            setIncomingKeys(new Set(added.map(connectionKey)));
            if (autoTest) {
                autoTestQueue.current.push(...added);
            }
        }

        if (isInitialLoad.current && connections.length > 0) {
            isInitialLoad.current = false;
        }
    }

    // Merge current + leaving connections for rendering
    const renderList = useMemo(() => {
        const currentKeys = new Set(connections.map(connectionKey));
        return [
            // incoming connections are already included here
            ...connections,
            // outgoing connections kept around so they have time to animate out
            ...outgoingConnections.filter(
                (c) => !currentKeys.has(connectionKey(c))
            ),
        ];
    }, [connections, outgoingConnections]);

    // Clear entering flags on next animation frame to trigger expand
    useEffect(() => {
        if (incomingKeys.size === 0) return;
        const frame = requestAnimationFrame(() => setIncomingKeys(new Set()));
        return () => cancelAnimationFrame(frame);
    }, [incomingKeys]);

    // Drain the autotest queue
    useEffect(() => {
        if (!autoTest) return;
        const pending = autoTestQueue.current.splice(0);
        for (const c of pending) {
            void testOne(c);
        }
    }, [autoTest, connections, testOne]);

    const removeKeyWhenAnimationComplete = (key: string) =>
        setOutgoingConnections((prev) =>
            prev.filter((c) => connectionKey(c) !== key)
        );

    const flipKey = `${renderList.map(connectionKey).join(',')}`;

    return (
        <Flipper flipKey={flipKey}>
            <Stack spacing={1} sx={{ contain: 'inline-size' }}>
                {renderList.map((c) => {
                    const key = connectionKey(c);
                    const isLeaving = outgoingConnections.some(
                        (lc) => connectionKey(lc) === key
                    );
                    const isEntering = incomingKeys.has(key);
                    const visible = !isLeaving && !isEntering;

                    return (
                        <Flipped key={key} flipId={key}>
                            <Collapse
                                in={visible}
                                onExited={
                                    isLeaving
                                        ? () =>
                                              removeKeyWhenAnimationComplete(
                                                  key
                                              )
                                        : undefined
                                }
                                unmountOnExit
                            >
                                <ConnectionAccordion
                                    connection={c}
                                    expanded={
                                        c.orphaned ? false : expandedKey === key
                                    }
                                    onToggle={
                                        c.orphaned
                                            ? () => {}
                                            : (isExpanded) =>
                                                  setExpandedKey(
                                                      isExpanded ? key : null
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
    );
}
