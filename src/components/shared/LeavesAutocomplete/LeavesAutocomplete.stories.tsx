import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete';

// ── Mock data ───────────────────────────────────────────────────────

const MOCK_LEAVES = [
    'acmeCo/anvils/metrics/collection-one',
    'acmeCo/prod/materialization/snowflake/landing/wikijs/real-time-sync',
    'acmeCo/prod/materialization/snowflake/landing/acmeCo/9/real-time-sync',
];

// ── Stateful wrapper ────────────────────────────────────────────────

function LeavesAutocompleteControlled(
    props: Omit<
        React.ComponentProps<typeof LeavesAutocomplete>,
        'value' | 'onChange'
    >
) {
    const [value, setValue] = useState('');
    return <LeavesAutocomplete {...props} value={value} onChange={setValue} />;
}

// ── Stories ──────────────────────────────────────────────────────────

const meta: Meta<typeof LeavesAutocomplete> = {
    title: 'Shared/LeavesAutocomplete',
    component: LeavesAutocomplete,
    parameters: {
        layout: 'padded',
    },
};

export default meta;

type Story = StoryObj<typeof LeavesAutocomplete>;

export const Default: Story = {
    render: () => (
        <LeavesAutocompleteControlled
            leaves={MOCK_LEAVES}
            label="Catalog Prefix"
            helperText='Use arrow keys and press "Enter" to select'
        />
    ),
};
