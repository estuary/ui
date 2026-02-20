import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Stack, TextField, Typography } from '@mui/material';

import { IntlProvider } from 'react-intl';

import { WizardDialog } from 'src/components/shared/WizardDialog';

// Only the messages WizardDialog's internals need
const messages: Record<string, string> = {
    'cta.back': 'Back',
    'cta.next': 'Next',
    'cta.save': 'Save',
    'cta.close': 'Close',
    'alert.error': 'Error',
    'wizardDialog.error.step': 'An error occurred during this step',
};

// ── Helpers ─────────────────────────────────────────────────────────

// Wrapper that manages the dialog open state and renders a trigger button
function DialogStory({
    onClose,
    ...props
}: Omit<React.ComponentProps<typeof WizardDialog>, 'open'>) {
    const [open, setOpen] = useState(true);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Dialog</button>
            <WizardDialog
                {...props}
                open={open}
                onClose={() => {
                    onClose();
                    setOpen(false);
                }}
            />
        </>
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

/** Three-step wizard demonstrating validation, async onProceed, and per-step titles */
export const Default: Story = {
    render: () => {
        const [name, setName] = useState('');
        const [attempted, setAttempted] = useState(false);

        return (
            <DialogStory
                title="Setup Wizard"
                onClose={() => {
                    setAttempted(false);
                    setName('');
                }}
                steps={[
                    {
                        title: 'Introduction',
                        component: (
                            <Stack sx={{ pb: 12 }}>
                                <Typography component="div">
                                    This wizard demo demonstrates{' '}
                                    <ol>
                                        <li>
                                            per-step titles and next button
                                            labels
                                        </li>
                                        <li>
                                            field validation that blocks
                                            advancement
                                        </li>
                                        <li>
                                            async onAdvance callback that shows
                                            loading spinner and fails the first
                                            time but succeeds on retry
                                        </li>
                                        <li>
                                            error message if onAdvance is
                                            rejected
                                        </li>
                                        <li>
                                            smooth transition between steps that
                                            have different content heights
                                        </li>
                                    </ol>
                                </Typography>
                            </Stack>
                        ),
                    },
                    {
                        title: 'Configuration',
                        component: (
                            <Stack spacing={2}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Step 2 requires a non-empty name before you
                                    can proceed, and clicking FAIL FIRST
                                    simulates an async save that fails the first
                                    time but succeeds on retry
                                </Typography>
                                <TextField
                                    label="Resource Name (required)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    fullWidth
                                />
                            </Stack>
                        ),
                        canAdvance: () => name.trim().length > 0,
                        onAdvance: () =>
                            new Promise((resolve, reject) =>
                                setTimeout(() => {
                                    if (attempted) {
                                        resolve(true);
                                    } else {
                                        setAttempted(true);
                                        reject(
                                            new Error(
                                                'Connection test failed: unable to reach endpoint. Try again.'
                                            )
                                        );
                                    }
                                }, 500)
                            ),
                        nextLabel: attempted ? 'Try again' : 'Fail first',
                    },
                    {
                        title: 'Summary',
                        component: (
                            <Stack spacing={2}>
                                <Typography>
                                    Your resource has been validated
                                    successfully.
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Click Save to finish setup, or go Back to
                                    make changes.
                                </Typography>
                            </Stack>
                        ),
                        nextLabel: 'Save & exit',
                    },
                ]}
            />
        );
    },
};
