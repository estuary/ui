import type { UserInfoStore } from 'src/context/UserInfoSummary/types';

import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormLabel,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';

import { usePostHog } from '@posthog/react';
import { Controller, useForm } from 'react-hook-form';

import { useTenantCreate } from 'src/api/gql/tenant';
import Logo from 'src/components/navigation/Logo';
import { OnboardingSurvey } from 'src/components/onboarding/Survey';
import AlertBox from 'src/components/shared/AlertBox';
import { supabaseClient } from 'src/context/GlobalProviders';
import { fireGtmEvent } from 'src/services/gtm';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const NAME_TAKEN_MESSAGE = 'is already in use';
const EVENT_NAME = 'Tenant:Create';

interface Props {
    mutate: UserInfoStore['mutate'];
}

const TenantCreate = ({ mutate }: Props) => {
    const postHog = usePostHog();
    const [creation, createTenant] = useTenantCreate();
    const methods = useForm({
        defaultValues: { name: '', origin: '' },
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const {
        control,
        getValues,
        handleSubmit,
        formState: { isSubmitting, isValid },
    } = methods;

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const saving = isSubmitting || creation.data?.tenantCreate === true;

    const submit = (confirmed = false) =>
        handleSubmit(
            async ({ name: requestedTenant, origin }) => {
                setServerError(null);

                if (
                    !confirmed &&
                    requestedTenant.toLowerCase().includes('test')
                ) {
                    setConfirmDialogOpen(true);
                    return;
                }

                setConfirmDialogOpen(false);

                const { data, error } = await createTenant({
                    input: {
                        name: requestedTenant,
                        survey: { origin, details: '' },
                    },
                });

                if (error || !data?.tenantCreate) {
                    const message =
                        error?.message ?? 'Unable to create organization';
                    const tenantTaken = message.includes(NAME_TAKEN_MESSAGE);

                    fireGtmEvent('RegisterFailed', {
                        tenantAlreadyTaken: tenantTaken,
                        tenant: requestedTenant,
                        ignore_referrer: true,
                    });
                    postHog.capture(EVENT_NAME, {
                        status: 'failure',
                        tenantAlreadyTaken: tenantTaken,
                        tenant: requestedTenant,
                    });
                    setServerError(message);
                    return;
                }

                fireGtmEvent('Register', {
                    tenant: requestedTenant,
                    ignore_referrer: true,
                });
                postHog.capture(EVENT_NAME, {
                    status: 'success',
                    tenant: requestedTenant,
                });
                await mutate?.();
            },
            (validationErrors) => {
                setServerError(null);
                logRocketEvent(CustomEvents.ONBOARDING, {
                    nameMissing: !getValues('name'),
                    surveyMissing: Boolean(validationErrors.origin),
                });
            }
        );

    return (
        <>
            <Stack
                spacing={3}
                sx={{
                    mt: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'left',
                }}
            >
                <Stack spacing={2} sx={{ alignItems: 'center' }}>
                    <Logo width={25} />
                    <Typography
                        component="h1"
                        align="center"
                        style={{ fontSize: 28, fontWeight: 300 }}
                        variant="h5"
                    >
                        Get started with Estuary
                    </Typography>
                </Stack>
            </Stack>

            <form
                noValidate
                onSubmit={(event) => {
                    if (saving || confirmDialogOpen) {
                        event.preventDefault();
                        return;
                    }
                    void submit()(event);
                }}
            >
                <Stack
                    spacing={3}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                        justifyContent: 'center',
                        mt: 5,
                    }}
                >
                    {serverError ? (
                        <AlertBox severity="error" short>
                            {serverError}
                        </AlertBox>
                    ) : null}

                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { ref, ...field } }) => (
                            <FormControl>
                                <FormLabel
                                    htmlFor="organization-name"
                                    required
                                    sx={{ mb: 1, fontSize: 20 }}
                                >
                                    Organization Name
                                </FormLabel>
                                <TextField
                                    {...field}
                                    id="organization-name"
                                    inputRef={ref}
                                    placeholder="acmeCo"
                                    autoComplete="organization"
                                    autoFocus
                                    required
                                    size="small"
                                    onChange={(event) => {
                                        const value = event.target.value
                                            .replace(/\s/g, '_')
                                            .replace(/[^a-zA-Z0-9._-]/g, '');
                                        if (value !== field.value)
                                            field.onChange(value);
                                    }}
                                    variant="outlined"
                                    sx={{
                                        // 'maxWidth': 424,
                                        '& .MuiOutlinedInput-root': {
                                            'bgcolor': 'background.default',
                                            'borderRadius': 3,
                                            '& fieldset': { border: 'none' },
                                        },
                                    }}
                                />
                            </FormControl>
                        )}
                    />

                    <Controller
                        name="origin"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <OnboardingSurvey
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <Toolbar
                        disableGutters
                        sx={{ justifyContent: 'space-between', width: '100%' }}
                    >
                        <Button
                            disabled={saving}
                            variant="outlined"
                            onClick={async () => {
                                await supabaseClient.auth.signOut();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            loading={saving}
                            disabled={saving || !isValid}
                        >
                            Continue
                        </Button>
                    </Toolbar>
                </Stack>
            </form>

            <Dialog
                fullWidth
                maxWidth="sm"
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                aria-labelledby="confirm-organization-name-title"
                aria-describedby="confirm-organization-name-description"
            >
                <DialogTitle id="confirm-organization-name-title">
                    Organization names are permanent
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-organization-name-description">
                        Consider a name without the word &quot;test&quot;.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button
                        onClick={() => setConfirmDialogOpen(false)}
                        autoFocus
                    >
                        Go back
                    </Button>
                    <Button
                        variant="contained"
                        disabled={saving || !isValid}
                        onClick={() => {
                            void submit(true)();
                        }}
                    >
                        {`Continue with "${getValues('name')}"`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TenantCreate;
