import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { PrefixAutocomplete } from 'src/components/shared/PrefixAutocomplete';

// ── Mock data ───────────────────────────────────────────────────────

const MOCK_LEAVES = [
    'acmeCo/anvils/metrics/collection-one',
    'acmeCo/prod/materialization/snowflake/landing/wikijs/real-time-sync/materialize-snowflake',
    'acmeCo/prod/materialization/snowflake/landing/acmeCo/9/real-time-sync/materialize-snowflake',
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
            helperText='Use arrow keys and press "Enter" to select'
        />
    ),
};
