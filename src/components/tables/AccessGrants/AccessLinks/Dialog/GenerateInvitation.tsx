import type { InviteErrorProps } from 'src/components/tables/AccessGrants/AccessLinks';
import type { Capability } from 'src/gql-types/graphql';

import { useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
} from '@mui/material';

import { usePostHog } from '@posthog/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useMutation } from 'urql';

import { CREATE_INVITE_LINK } from 'src/api/gql/inviteLinks';
import { RHFLeavesAutocomplete } from 'src/components/shared/RHFFields';
import { usePrefixes } from 'src/hooks/usePrefixes';
import {
    appendWithForwardSlash,
    validateCatalogName,
} from 'src/utils/misc-utils';

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.
const capabilityOptions: Capability[] = ['admin', 'read'];
const EVENT_NAME = 'Invite:Create';

interface InviteFormData {
    prefix: string;
}

const prefixRules = {
    partial: {
        validate: (value: string) => validateCatalogName(value) ?? true,
    },
    final: {
        required: 'Estuary prefix is required.',
    },
};

export function GenerateInvitation({ setError }: InviteErrorProps) {
    const postHog = usePostHog();

    const [{ fetching }, createMutation] = useMutation(CREATE_INVITE_LINK);

    const prefixes = usePrefixes();
    const form = useForm<InviteFormData>({ defaultValues: { prefix: '' } });
    const prefix = form.watch('prefix');
    const catalogPrefix = appendWithForwardSlash(prefix);
    const prefixError = !prefix
        ? 'Estuary prefix is required.'
        : validateCatalogName(prefix);
    const [capability, setCapability] = useState<Capability | null>(null);
    const [singleUse, setSingleUse] = useState(true);
    async function createInvite() {
        if (prefixError || !capability) return;

        const result = await createMutation({
            catalogPrefix,
            capability,
            singleUse,
        });

        setError(result.error ?? null);

        if (!result.error) {
            form.reset();
            setCapability(null);
        }

        postHog.capture(EVENT_NAME, {
            status: result.error ? 'failure' : 'success',
            capability,
            singleUse,
        });
    }

    return (
        <FormProvider {...form}>
            <Stack sx={{ mb: 2 }} spacing={0}>
                <Stack spacing={1} sx={{ pt: 1 }}>
                    <Stack spacing={1}>
                        <Box sx={{ flex: 1 }}>
                            <RHFLeavesAutocomplete<InviteFormData>
                                name="prefix"
                                leaves={prefixes}
                                label="Prefix"
                                required
                                progressiveRules={prefixRules}
                            />
                        </Box>
                    </Stack>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <FormControl>
                        <RadioGroup
                            row
                            aria-label="Capability"
                            value={capability ?? ''}
                            onChange={(_event, value) =>
                                setCapability(value as Capability)
                            }
                        >
                            {capabilityOptions.map((option) => (
                                <FormControlLabel
                                    key={option}
                                    value={option}
                                    control={<Radio size="small" />}
                                    label={
                                        option === 'admin'
                                            ? 'Admin'
                                            : 'Read only'
                                    }
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!singleUse}
                                    onChange={(event) => {
                                        setSingleUse(!event.target.checked);
                                    }}
                                />
                            }
                            label="Reusable invite"
                            slotProps={{
                                typography: { fontSize: 12 },
                            }}
                        />
                        <Button
                            loading={fetching}
                            disabled={
                                fetching || Boolean(prefixError) || !capability
                            }
                            onClick={createInvite}
                        >
                            Create Invite Link
                        </Button>
                    </Stack>
                </Stack>
                <Divider sx={{ mt: 2 }} />
            </Stack>
        </FormProvider>
    );
}
