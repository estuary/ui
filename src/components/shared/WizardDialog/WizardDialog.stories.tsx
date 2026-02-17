import type { Meta, StoryObj } from '@storybook/react/dist/index';

import { useState } from 'react';

import {
    Box,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material';

import { WizardDialog } from './WizardDialog';
import { IntlProvider } from 'react-intl';

// Only the messages WizardDialog's internals need
const messages: Record<string, string> = {
    'cta.back': 'Back',
    'cta.next': 'Next',
    'cta.save': 'Save',
    'cta.close': 'Close',
};

// ── Helpers ─────────────────────────────────────────────────────────

// Wrapper that manages the dialog open state and renders a trigger button
function DialogStory(
    props: Omit<React.ComponentProps<typeof WizardDialog>, 'open' | 'onCancel'>
) {
    const [open, setOpen] = useState(true);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Dialog</button>
            <WizardDialog
                {...props}
                open={open}
                onCancel={() => setOpen(false)}
            />
        </>
    );
}

// ── Mock step components ────────────────────────────────────────────

function StepOne() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>
                Configure the basic settings for your new resource.
            </Typography>
            <TextField label="Name" placeholder="my-resource" fullWidth />
            <TextField
                label="Description"
                placeholder="Optional description"
                fullWidth
            />
        </Box>
    );
}

function StepTwo() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Choose a provider for this resource.</Typography>
            <FormControl>
                <RadioGroup defaultValue="s3">
                    <FormControlLabel
                        value="s3"
                        control={<Radio />}
                        label="Amazon S3"
                    />
                    <FormControlLabel
                        value="gcs"
                        control={<Radio />}
                        label="Google Cloud Storage"
                    />
                    <FormControlLabel
                        value="azure"
                        control={<Radio />}
                        label="Azure Blob Storage"
                    />
                </RadioGroup>
            </FormControl>
        </Box>
    );
}

// ── Meta ─────────────────────────────────────────────────────────────

const meta: Meta<typeof WizardDialog> = {
    title: 'Shared/WizardDialog',
    component: WizardDialog,
    decorators: [
        (Story: React.ComponentType) => (
            <IntlProvider locale="en" messages={messages}>
                <Story />
            </IntlProvider>
        ),
    ],
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof WizardDialog>;

// ── Stories ──────────────────────────────────────────────────────────

/** Each step overrides the dialog title */
export const PerStepTitlesAndButtonLabels: Story = {
    render: () => (
        <DialogStory
            title="Wizard"
            steps={[
                {
                    component: <StepOne />,
                    title: 'Step 1: Basic Settings',
                    nextLabel: 'Continue',
                },
                {
                    component: <StepTwo />,
                    title: 'Step 2: Choose Provider',
                    nextLabel: 'Save and Close',
                },
            ]}
        />
    ),
};

/** A single-step dialog — no Back button, Next acts as Save */
export const SingleStep: Story = {
    render: () => (
        <DialogStory
            title="Quick Setup"
            steps={[{ component: <StepOne />, nextLabel: 'Save' }]}
        />
    ),
};

/** Demonstrates canAdvance — the Next button is disabled until the input has a value */
export const WithValidation: Story = {
    render: () => {
        const [name, setName] = useState('');

        return (
            <DialogStory
                title="Validated Wizard"
                steps={[
                    {
                        component: (
                            <TextField
                                label="Name (required)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                            />
                        ),
                        canAdvance: () => name.trim().length > 0,
                    },
                    { component: <StepTwo /> },
                ]}
            />
        );
    },
};

/** Demonstrates onProceed with an async operation — shows the loading spinner */
export const AsyncStepValidation: Story = {
    render: () => (
        <DialogStory
            title="Async Wizard"
            steps={[
                {
                    component: (
                        <Typography>
                            Clicking Next will simulate a 2-second async
                            validation.
                        </Typography>
                    ),
                    onProceed: () =>
                        new Promise((resolve) =>
                            setTimeout(() => resolve(true), 2000)
                        ),
                },
                { component: <StepTwo /> },
            ]}
        />
    ),
};

/** Demonstrates an onProceed that rejects — the error is shown inline */
export const AsyncStepError: Story = {
    render: () => (
        <DialogStory
            title="Error Handling"
            steps={[
                {
                    component: (
                        <Typography>
                            Clicking Next will simulate a failed async
                            operation.
                        </Typography>
                    ),
                    onProceed: () =>
                        new Promise((_resolve, reject) =>
                            setTimeout(
                                () =>
                                    reject(
                                        new Error(
                                            'Connection test failed: unable to reach endpoint'
                                        )
                                    ),
                                500
                            )
                        ),
                },
                { component: <StepTwo /> },
            ]}
        />
    ),
};
