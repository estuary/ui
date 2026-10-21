import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ComponentType } from 'react';

import { useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import {
    CatalogIdentity,
    CatalogIdentityEditor,
} from 'src/components/shared/CatalogIdentity';
import { ensureTrailingSlash, splitCatalogName } from 'src/utils/misc-utils';

const LEAVES = [
    'acmeCo/development/events',
    'acmeCo/staging/events',
    'acmeCo/production/analytics/orders',
];

const GENERATED_NAMES = ['Bright.Badger', 'Calm_Crane', 'Swift-Sparrow'];

function EditableIdentity({ catalogName }: { catalogName: string }) {
    const { prefix, leaf } = splitCatalogName(catalogName);
    const [name, setName] = useState(leaf);
    const [homePrefix, setHomePrefix] = useState(prefix);
    const [generation, setGeneration] = useState(0);
    const previewName = `${homePrefix ? ensureTrailingSlash(homePrefix) : ''}${name}`;

    return (
        <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
                Click either field or Tab into it to edit. Use Tab and Shift+Tab
                to move between fields. Spaces in the name become underscores.
            </Typography>
            <Button size="small" sx={{ alignSelf: 'flex-start' }}>
                Tab from here
            </Button>
            <CatalogIdentityEditor
                name={name}
                onNameChange={setName}
                homePrefix={homePrefix}
                onHomePrefixChange={setHomePrefix}
                homePrefixHelperText="The home prefix controls who may manage the service account"
                leaves={LEAVES}
                onRegenerate={() => {
                    setName(
                        GENERATED_NAMES[generation % GENERATED_NAMES.length]
                    );
                    setGeneration(generation + 1);
                }}
            />
            <Button size="small" sx={{ alignSelf: 'flex-start' }}>
                Shift+Tab from here
            </Button>
            <Typography variant="overline">Display preview</Typography>
            <CatalogIdentity catalogName={previewName} />
        </Stack>
    );
}

const meta = {
    title: 'Shared/CatalogIdentity',
    component: CatalogIdentity,
    parameters: { layout: 'padded' },
    decorators: [
        (Story: ComponentType) => (
            <Box sx={{ width: 520, maxWidth: '100%' }}>
                <Story />
            </Box>
        ),
    ],
    args: { catalogName: 'acmeCo/production/Swift-Sparrow', scale: 1 },
    argTypes: {
        catalogName: { control: 'text' },
        scale: { control: { type: 'range', min: 0.75, max: 2, step: 0.25 } },
        sx: { control: false },
    },
} satisfies Meta<typeof CatalogIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args: ComponentProps<typeof CatalogIdentity>) => (
        <Stack spacing={3}>
            <Typography variant="overline">Small (0.75×)</Typography>
            <CatalogIdentity {...args} scale={0.75} />
            <Typography variant="overline">Default</Typography>
            <CatalogIdentity {...args} />
            <Typography variant="overline">Enlarged (1.25×)</Typography>
            <CatalogIdentity {...args} scale={1.25} />
        </Stack>
    ),
};

export const LongName: Story = {
    args: {
        catalogName:
            'acmeCo/production/analytics/customer-data/Long_Service.Account-Name',
    },
    decorators: [
        (Story: ComponentType) => (
            <Box sx={{ width: 300, maxWidth: '100%' }}>
                <Story />
            </Box>
        ),
    ],
};

export const Editable: Story = {
    parameters: { controls: { exclude: ['scale', 'sx'] } },
    render: ({ catalogName }: ComponentProps<typeof CatalogIdentity>) => (
        <EditableIdentity key={catalogName} catalogName={catalogName} />
    ),
};

export const Empty: Story = {
    ...Editable,
    args: { catalogName: '' },
};
