import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { useState } from 'react';

import { Box, Button, IconButton, Stack, Typography } from '@mui/material';

import { Xmark } from 'iconoir-react';

import { List, ListItem } from 'src/components/shared/List';

interface DemoItem {
    id: number;
    label: string;
}

const INITIAL_ITEMS: DemoItem[] = [
    { id: 1, label: 'acmeCo/orders' },
    { id: 2, label: 'acmeCo/customers' },
    { id: 3, label: 'acmeCo/products' },
];

// ── Helpers ─────────────────────────────────────────────────────────

function ListDemo({ spacing }: { spacing?: number }) {
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [nextId, setNextId] = useState(INITIAL_ITEMS.length + 1);

    const addItem = () => {
        const index = Math.floor(Math.random() * (items.length + 1));
        const item = { id: nextId, label: `acmeCo/collection-${nextId}` };

        setItems([...items.slice(0, index), item, ...items.slice(index)]);
        setNextId(nextId + 1);
    };

    const removeItem = (id: number) =>
        setItems(items.filter((item) => item.id !== id));

    const shuffle = () =>
        setItems(
            items
                .map((item) => ({ item, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ item }) => item)
        );

    return (
        <Stack spacing={2} sx={{ width: 360 }}>
            <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" onClick={addItem}>
                    Add
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={shuffle}
                    disabled={items.length < 2}
                >
                    Shuffle
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setItems(INITIAL_ITEMS)}
                >
                    Reset
                </Button>
            </Stack>

            <List spacing={spacing}>
                {items.map((item) => (
                    <ListItem key={item.id}>
                        <Typography variant="body2">{item.label}</Typography>
                        <IconButton
                            aria-label={`Remove ${item.label}`}
                            size="small"
                            onClick={() => removeItem(item.id)}
                        >
                            <Xmark width={16} height={16} />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            {items.length === 0 ? (
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        The list is empty.
                    </Typography>
                </Box>
            ) : null}
        </Stack>
    );
}

// ── Meta ─────────────────────────────────────────────────────────────

const meta: Meta<typeof List> = {
    title: 'Shared/List',
    component: List,
    parameters: {
        layout: 'centered',
    },
    args: {
        spacing: 1,
    },
};

export default meta;

type Story = StoryObj<typeof List>;

// ── Stories ──────────────────────────────────────────────────────────

/** Add, remove, and shuffle items to see the enter, exit, and reorder animations */
export const Default: Story = {
    render: ({ spacing }: ComponentProps<typeof List>) => (
        <ListDemo spacing={spacing} />
    ),
};
