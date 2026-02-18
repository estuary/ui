import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, Button, Typography } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';

import { RHFPrefixAutocomplete } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/PrefixAutocomplete';
import { RHFSelect } from 'src/components/shared/RHFFields/RHFSelect';

interface DemoFormValues {
    region: string;
    prefix: string;
    dataplanes: string[];
    enableBackfill: boolean;
    enableNotifications: boolean;
}

const prefixLeaves = [
    'acmeCo/anvils/metrics/collection-one',
    'acmeCo/prod/materialization/snowflake/landing/wikijs/real-time-sync/materialize-snowflake',
    'acmeCo/prod/materialization/snowflake/landing/acmeCo/9/real-time-sync/materialize-snowflake',
];

const regionOptions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'EU West (Ireland)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
];

function DemoForm() {
    const methods = useForm<DemoFormValues>({
        defaultValues: {
            region: '',
            prefix: '',
            dataplanes: [],
            enableBackfill: false,
            enableNotifications: true,
        },
    });

    return (
        <FormProvider {...methods}>
            <Box
                component="form"
                onSubmit={methods.handleSubmit((data) =>
                    alert(JSON.stringify(data, null, 2))
                )}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: 400,
                }}
            >
                <Typography variant="h6">RHF Fields Demo</Typography>

                <RHFSelect<DemoFormValues>
                    name="region"
                    label="Region"
                    options={regionOptions}
                    required
                    rules={{ required: 'Region is required' }}
                    helperText="Where your data will be stored"
                />

                <RHFPrefixAutocomplete<DemoFormValues>
                    name="prefix"
                    leaves={prefixLeaves}
                    label="Catalog Prefix"
                    required
                    helperText="Select a catalog prefix"
                />

                <Button type="submit" variant="contained" size="small">
                    Submit
                </Button>
            </Box>
        </FormProvider>
    );
}

const meta: Meta = {
    title: 'Shared/RHFFields',
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj;

export const AllFields: Story = {
    render: () => <DemoForm />,
};
