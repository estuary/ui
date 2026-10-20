import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PublicDataPlane } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import { FormControl, FormLabel, Paper, Typography } from '@mui/material';

import { Controller, useForm } from 'react-hook-form';

import { DataPlanePicker } from 'src/components/onboarding/DataPlanePicker/DataPlanePicker';

// ── Mock data ───────────────────────────────────────────────────────

const plane = (
    cloudProvider: PublicDataPlane['cloudProvider'],
    region: string,
    cluster = 'c1'
): PublicDataPlane => ({
    name: `ops/dp/public/${cloudProvider.toLowerCase()}-${region}-${cluster}`,
    cloudProvider,
    region,
});

// Production's planes, in the order the API returns them.
const PRODUCTION_PLANES = [
    plane('AWS', 'ap-southeast-2'),
    plane('AWS', 'eu-west-1'),
    plane('AWS', 'us-east-1', 'c1'),
    plane('AWS', 'us-east-1', 'c2'),
    plane('AWS', 'us-west-2'),
    plane('AZURE', 'centralus'),
    plane('GCP', 'us-central1'),
];

// ── Form wrapper ────────────────────────────────────────────────────

interface DemoProps {
    dataPlanes: PublicDataPlane[];
    defaultValue?: string;
    disabled?: boolean;
    loading?: boolean;
}

function Demo({ dataPlanes, defaultValue = '', disabled, loading }: DemoProps) {
    const { control, watch } = useForm({
        defaultValues: { dataPlane: defaultValue },
    });

    return (
        <Paper sx={{ p: 4, maxWidth: 520 }}>
            <Controller
                name="dataPlane"
                control={control}
                rules={{ required: true }}
                render={({ field: { ref, ...field } }) => (
                    <FormControl required fullWidth>
                        <FormLabel
                            id="data-plane-label"
                            sx={{ mb: 1, fontSize: 20 }}
                        >
                            Data plane
                        </FormLabel>
                        <DataPlanePicker
                            {...field}
                            inputRef={ref}
                            labelId="data-plane-label"
                            id="data-plane"
                            dataPlanes={dataPlanes}
                            loading={loading}
                            disabled={disabled}
                        />
                    </FormControl>
                )}
            />
            <Typography
                variant="caption"
                component="p"
                sx={{ mt: 2, fontFamily: 'monospace' }}
            >
                form value: {JSON.stringify(watch('dataPlane'))}
            </Typography>
        </Paper>
    );
}

// ── Stories ──────────────────────────────────────────────────────────

const meta: Meta<typeof Demo> = {
    title: 'Onboarding/DataPlanePicker',
    component: Demo,
    parameters: {
        layout: 'padded',
    },
};

export default meta;

type Story = StoryObj<typeof Demo>;

export const Default: Story = {
    args: { dataPlanes: PRODUCTION_PLANES },
};

export const Selected: Story = {
    args: {
        dataPlanes: PRODUCTION_PLANES,
        defaultValue: plane('AWS', 'eu-west-1').name,
    },
};

export const UnknownProviderAndRegion: Story = {
    args: {
        dataPlanes: [
            ...PRODUCTION_PLANES,
            plane('AWS', 'ca-central-1'),
            {
                name: 'ops/dp/public/local-cluster',
                cloudProvider: 'LOCAL',
                region: 'cluster',
            },
        ],
    },
};

export const Loading: Story = {
    args: { dataPlanes: [], loading: true, disabled: true },
};

export const Empty: Story = {
    args: { dataPlanes: [], disabled: true },
};
