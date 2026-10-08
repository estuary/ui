import type { SxProps, Theme } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';

import { Children, isValidElement, useEffect, useMemo, useState } from 'react';

import { Box, Collapse } from '@mui/material';

import { Flipped, Flipper } from 'react-flip-toolkit';

const DEFAULT_STYLES: SxProps<Theme> = {
    listStyle: 'none',
    m: 0,
    p: 0,
};

type EntryState = 'entering' | 'present' | 'exiting';

interface Entry {
    key: string;
    element: ReactElement;
    state: EntryState;
}

interface ListProps {
    children?: ReactNode;
    spacing?: number;
    sx?: SxProps<Theme>;
}

export function List({ children, spacing, sx }: ListProps) {
    const [prevChildren, setPrevChildren] = useState(children);
    const [entries, setEntries] = useState<Entry[]>(() =>
        reconcile([], children).map((entry) => ({
            ...entry,
            state: 'present',
        }))
    );

    // Reconcile during render, not in an effect, so new items mount collapsed
    // and removed items never vanish for a frame before animating out
    if (prevChildren !== children) {
        setPrevChildren(children);
        setEntries((prev) => reconcile(prev, children));
    }

    // Entering items mount with Collapse `in={false}`; flip them to `present`
    // on the next frame so they transition open.
    const hasEntering = entries.some(({ state }) => state === 'entering');
    useEffect(() => {
        if (!hasEntering) return;

        const frame = requestAnimationFrame(() =>
            setEntries((prev) =>
                prev.map((entry) =>
                    entry.state === 'entering'
                        ? { ...entry, state: 'present' }
                        : entry
                )
            )
        );

        return () => cancelAnimationFrame(frame);
    }, [hasEntering]);

    const handleExited = (key: string) => {
        setEntries((prev) =>
            prev.filter(
                (entry) => !(entry.key === key && entry.state === 'exiting')
            )
        );
    };

    const styles = useMemo(
        () => [DEFAULT_STYLES, ...(Array.isArray(sx) ? sx : [sx])],
        [sx]
    );

    return (
        <Flipper flipKey={entries.map(({ key }) => key).join(',')}>
            <Box component="ul" sx={styles}>
                {entries.map(({ key, element, state }, idx) => (
                    <Flipped key={key} flipId={key}>
                        <Collapse
                            component="li"
                            in={state === 'present'}
                            onExited={() => handleExited(key)}
                            unmountOnExit
                        >
                            <Box sx={{ pt: idx === 0 ? 0 : spacing }}>
                                {element}
                            </Box>
                        </Collapse>
                    </Flipped>
                ))}
            </Box>
        </Flipper>
    );
}

// Builds the entries to render from the current children. New keys start as
// `entering`, and keys that disappeared stay in place as `exiting` until their
// collapse animation finishes.
function reconcile(prev: Entry[], children: ReactNode): Entry[] {
    const prevByKey = new Map(prev.map((entry) => [entry.key, entry]));

    const next: Entry[] = Children.toArray(children)
        .filter(isValidElement)
        .map((element) => {
            const key = String(element.key);
            const existing = prevByKey.get(key);

            return {
                key,
                element,
                state: !existing
                    ? 'entering'
                    : existing.state === 'exiting'
                      ? 'present'
                      : existing.state,
            };
        });

    const nextKeys = new Set(next.map((entry) => entry.key));

    prev.forEach((entry, index) => {
        if (nextKeys.has(entry.key)) {
            return;
        }

        // Insert after the nearest earlier item that is still rendered
        let anchor = -1;
        for (let i = index - 1; i >= 0 && anchor === -1; i -= 1) {
            anchor = next.findIndex(({ key }) => key === prev[i].key);
        }

        next.splice(anchor + 1, 0, { ...entry, state: 'exiting' });
    });

    return next;
}
