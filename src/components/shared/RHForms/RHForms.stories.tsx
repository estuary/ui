import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box, Button, Typography } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';

import { RHFSelect } from 'src/components/shared/RHForms/RHFSelect';

interface DemoFormValues {
    region: string;
    dataplanes: string[];
    enableBackfill: boolean;
    enableNotifications: boolean;
}

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

                <Button type="submit" variant="contained" size="small">
                    Submit
                </Button>
            </Box>
        </FormProvider>
    );
}

const meta: Meta = {
    title: 'Shared/RHForms',
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj;

export const AllFields: Story = {
    render: () => <DemoForm />,
};
