import type { Meta, StoryObj } from '@storybook/react-vite';

import { useMemo } from 'react';

import { Button, Stack, Typography } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';
import { IntlProvider } from 'react-intl';

import { useCouldMatchRoot } from 'src/components/shared/LeavesAutocomplete';
import { RHFLeavesAutocomplete } from 'src/components/shared/RHFFields/RHFLeavesAutocomplete';
import { RHFSelect } from 'src/components/shared/RHFFields/RHFSelect';
import { RHFTextField } from 'src/components/shared/RHFFields/RHFTextField';

const messages: Record<string, string> = {
    'leavesAutocomplete.mustStartWith.single': 'Must start with `{root}`',
    'leavesAutocomplete.mustStartWith.multiple':
        'Must start with one of: {roots}',
};

interface DemoFormValues {
    prefix: string;
    displayName: string;
    region: string;
}

const prefixRoots = ['acmeCo/', 'globex/'];

const prefixLeaves = [
    'acmeCo/anvils/metrics/collection-one',
    'acmeCo/prod/materialization/snowflake/landing/wikijs/real-time-sync',
    'acmeCo/prod/materialization/snowflake/landing/acmeCo/9/real-time-sync',
];

function DemoForm() {
    const methods = useForm<DemoFormValues>({
        mode: 'onChange',
        defaultValues: {
            prefix: '',
            displayName: '',
            region: '',
        },
    });

    const couldMatchRoot = useCouldMatchRoot(prefixRoots);

    const prefixRules = useMemo(
        () => ({
            partialRules: { validate: couldMatchRoot },
            finalRules: {
                validate: {
                    disallowedValue: (value: any) =>
                        value === 'acmeCo/'
                            ? 'Choose another prefix (this is validated only on blur, in case the user is still typing a more specific prefix)'
                            : true,
                },
            },
        }),
        [couldMatchRoot]
    );

    const displayNameRules = useMemo(
        () => ({
            partialRules: {
                pattern: {
                    value: /^[a-zA-Z]*$/,
                    message: 'only letters are allowed',
                },
                maxLength: {
                    value: 6,
                    message: 'must be no more than 6 chars',
                },
                validate: (value: any) =>
                    value === 'admin' ? 'This value is reserved' : true,
            },
            finalRules: {
                required: 'Display Name is required' as const,
                minLength: {
                    value: 3,
                    message: 'Must be at least 3 characters',
                },
            },
        }),
        []
    );

    return (
        <FormProvider {...methods}>
            <Stack
                component="form"
                onSubmit={methods.handleSubmit((data) =>
                    alert(JSON.stringify(data, null, 2))
                )}
                spacing={2}
                sx={{
                    width: 400,
                }}
            >
                <Typography variant="h6">RHF Fields Demo</Typography>

                <RHFLeavesAutocomplete<DemoFormValues>
                    name="prefix"
                    leaves={prefixLeaves}
                    label="Catalog Prefix"
                    required
                    helperText="Select a catalog prefix"
                    {...prefixRules}
                />

                <RHFTextField<DemoFormValues>
                    name="displayName"
                    label="Display Name"
                    required
                    helperText="Enter a display name"
                    {...displayNameRules}
                />

                <RHFSelect<DemoFormValues>
                    name="region"
                    label="Region"
                    required
                    helperText="Select a deployment region"
                    rules={{
                        required: 'region is required',
                        validate: (value) => {
                            if (value == 'us-east-1')
                                return 'Pick a different one';
                            return true;
                        },
                    }}
                    options={[
                        {
                            label: 'US East (not this one)',
                            value: 'us-east-1',
                        },
                        { label: 'US West', value: 'us-west-2' },
                        { label: 'EU West', value: 'eu-west-1' },
                    ]}
                />

                <Button type="submit" variant="contained" size="small">
                    Submit
                </Button>
            </Stack>
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
    render: () => (
        <IntlProvider locale="en" messages={messages}>
            <DemoForm />
        </IntlProvider>
    ),
};
