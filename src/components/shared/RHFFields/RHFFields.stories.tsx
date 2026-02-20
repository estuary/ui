import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, Stack, Typography } from '@mui/material';

import { FormProvider, useForm } from 'react-hook-form';
import { IntlProvider } from 'react-intl';

import { useCouldMatchRoot } from 'src/components/shared/PrefixAutocomplete';
import { RHFPrefixAutocomplete } from 'src/components/shared/RHFFields/RHFPrefixAutocomplete';

const messages: Record<string, string> = {
    'prefixAutocomplete.mustStartWith.single': 'Must start with `{root}`',
    'prefixAutocomplete.mustStartWith.multiple':
        'Must start with one of: {roots}',
};

interface DemoFormValues {
    prefix: string;
}

const prefixRoots = ['acmeCo/', 'globex/'];

const prefixLeaves = [
    'acmeCo/anvils/metrics/collection-one',
    'acmeCo/prod/materialization/snowflake/landing/wikijs/real-time-sync/materialize-snowflake',
    'acmeCo/prod/materialization/snowflake/landing/acmeCo/9/real-time-sync/materialize-snowflake',
];

function DemoForm() {
    const methods = useForm<DemoFormValues>({
        defaultValues: {
            prefix: '',
        },
    });

    const couldMatchRoot = useCouldMatchRoot(prefixRoots);

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

                <RHFPrefixAutocomplete<DemoFormValues>
                    name="prefix"
                    leaves={prefixLeaves}
                    label="Catalog Prefix"
                    required
                    helperText="Select a catalog prefix"
                    onChangeValidate={{ couldMatchRoot }}
                    onBlurValidate={{
                        disallowedValue: (value) =>
                            value === 'acmeCo/'
                                ? 'Choose another prefix (this is validated only on blur, in case the user is still typing a more specific prefix)'
                                : true,
                    }}
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
