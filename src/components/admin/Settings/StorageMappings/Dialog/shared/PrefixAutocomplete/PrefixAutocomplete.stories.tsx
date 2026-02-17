import type { Meta, StoryObj } from '@storybook/react/dist/index';

import { useState } from 'react';

import { PrefixAutocomplete } from './PrefixAutocomplete';

// ── Mock data ───────────────────────────────────────────────────────

const MOCK_LEAVES = [
    'globex/engineering',
    'globex/marketing',
    'acmeCo/capture-one',
    'acmeCo/anvils/materialize-one',
    'acmeCo/anvils/metrics/collection-one',
    'acmeCo/widgets/capture-two',
    'deel/prod/materialization/snowflake/landing/wikijs/real-time-sync/materialize-snowflake',
    'deel/prod/materialization/snowflake/landing/deel/9/real-time-sync/materialize-snowflake',
];

// ── Stateful wrapper ────────────────────────────────────────────────

function PrefixAutocompleteControlled(
    props: Omit<
        React.ComponentProps<typeof PrefixAutocomplete>,
        'value' | 'onChange'
    >
) {
    const [value, setValue] = useState('');
    return <PrefixAutocomplete {...props} value={value} onChange={setValue} />;
}

// ── Stories ──────────────────────────────────────────────────────────

const meta: Meta<typeof PrefixAutocomplete> = {
    title: 'Admin/StorageMappings/PrefixAutocomplete',
    component: PrefixAutocomplete,
    parameters: {
        layout: 'padded',
    },
};

export default meta;

type Story = StoryObj<typeof PrefixAutocomplete>;

export const Default: Story = {
    render: () => (
        <PrefixAutocompleteControlled
            leaves={MOCK_LEAVES}
            label="Catalog Prefix"
        />
    ),
};

export const Required: Story = {
    render: () => (
        <PrefixAutocompleteControlled
            leaves={MOCK_LEAVES}
            label="Catalog Prefix"
            required
        />
    ),
};

export const WithHelperText: Story = {
    render: () => (
        <PrefixAutocompleteControlled
            leaves={MOCK_LEAVES}
            label="Catalog Prefix"
            helperText="Choose a prefix for your storage mapping"
        />
    ),
};

export const WithError: Story = {
    render: () => (
        <PrefixAutocompleteControlled
            leaves={MOCK_LEAVES}
            label="Catalog Prefix"
            error
            errorMessage="Must start with one of: acmeCo/"
        />
    ),
};

export const PreFilled: Story = {
    render: () => {
        const [value, setValue] = useState('acmeCo/anvils/');
        return (
            <PrefixAutocomplete
                leaves={MOCK_LEAVES}
                label="Catalog Prefix"
                value={value}
                onChange={setValue}
            />
        );
    },
};
