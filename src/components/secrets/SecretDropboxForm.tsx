import type { FormEvent } from 'react';

import { useCallback, useMemo, useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { Eye, EyeClosed } from 'iconoir-react';
import { debounce } from 'lodash';

import AlertBox from 'src/components/shared/AlertBox';
import { useCanEditSecret } from 'src/hooks/secrets/useCanEditSecret';
import { useGetSecret } from 'src/hooks/secrets/useGetSecret';
import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import { normalizeError } from 'src/utils/errors';
import { getParentPrefix } from 'src/utils/names';

const SET_SECRET_DEBOUNCE_MS = 300;

interface SecretDropboxFormProps {
    secretName: string;
}

export function SecretDropboxForm({ secretName }: SecretDropboxFormProps) {
    const setSecret = useSetSecret();

    const {
        canEdit,
        fetching: permissionFetching,
        error: permissionError,
    } = useCanEditSecret(secretName);

    const {
        secret,
        fetching: existsFetching,
        error: existsError,
    } = useGetSecret(secretName);

    const [value, setValue] = useState('');
    const [showValue, setShowValue] = useState(false);
    const [overwriteConfirmed, setOverwriteConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);
    const exists = Boolean(secret?.secretId);

    const setSecretDebounced = useMemo(() => {
        return debounce(
            async (catalogName: string, value: string) => {
                try {
                    await setSecret(catalogName, value);
                    setSaved(true);
                } catch (err) {
                    const nerr = normalizeError(err);
                    setSubmitError(nerr);
                } finally {
                    setValue('');
                    setSubmitting(false);
                }
            },
            SET_SECRET_DEBOUNCE_MS,
            { leading: true, trailing: false }
        );
    }, [setSecret]);

    const handleSubmit = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            setSubmitError(null);
            setSubmitting(true);
            setSecretDebounced(secretName, value);
        },
        [secretName, value, setSecretDebounced]
    );

    // Wait for both checks so the form never flashes the wrong state, and an
    // overwrite never skips its warning
    const loading =
        (permissionFetching && !permissionError) ||
        (canEdit && existsFetching && !existsError);
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const loadError = permissionError ?? existsError;
    if (loadError) {
        return (
            <AlertBox short severity="error">
                We could not load this secret. Reload the page to try again.
            </AlertBox>
        );
    }

    if (!canEdit) {
        return (
            <AlertBox short severity="error">
                You don&apos;t have permission to set secrets under{' '}
                {getParentPrefix(secretName)}
            </AlertBox>
        );
    }

    if (saved) {
        return (
            <AlertBox short severity="success">
                Secret saved. You can close this page and return to your agent.
            </AlertBox>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
                <TextField
                    label="Secret name"
                    value={secretName}
                    size="small"
                    disabled
                />

                <TextField
                    label="Secret value"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    multiline
                    maxRows={5}
                    size="small"
                    required
                    autoFocus
                    sx={
                        showValue
                            ? undefined
                            : { '& textarea': { WebkitTextSecurity: 'disc' } }
                    }
                    slotProps={{
                        // Keep the value out of LogRocket and PostHog, and out
                        // of browser autofill and spellcheck services.
                        htmlInput: {
                            'data-private': true,
                            'className': 'ph-no-capture',
                            'autoComplete': 'new-password',
                            'autoCorrect': 'off',
                            'autoCapitalize': 'off',
                            'spellCheck': false,
                            'data-1p-ignore': true,
                            'data-lpignore': true,
                            'data-bwignore': true,
                            'data-form-type': 'other',
                        },
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showValue
                                                ? 'Hide value'
                                                : 'Show value'
                                        }
                                        onClick={() =>
                                            setShowValue((shown) => !shown)
                                        }
                                        edge="end"
                                        size="small"
                                    >
                                        {showValue ? <EyeClosed /> : <Eye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {exists ? (
                    <Stack spacing={1}>
                        <AlertBox short severity="warning">
                            A secret with this name already exists. Saving
                            replaces its value for every task that uses it.
                            Confirm by checking the box below.
                        </AlertBox>
                        <FormControlLabel
                            sx={{ ml: 0 }}
                            control={
                                <Checkbox
                                    sx={{ pl: 0 }}
                                    checked={overwriteConfirmed}
                                    onChange={(event) =>
                                        setOverwriteConfirmed(
                                            event.target.checked
                                        )
                                    }
                                />
                            }
                            label="Replace the existing value"
                        />
                    </Stack>
                ) : null}

                {submitError ? (
                    <AlertBox short severity="error">
                        {submitError.message || 'Unknown error'}
                    </AlertBox>
                ) : null}

                <Box>
                    <Button
                        type="submit"
                        variant="contained"
                        loading={submitting}
                        disabled={!value || (exists && !overwriteConfirmed)}
                    >
                        Save secret
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary">
                    The value is encrypted before it&apos;s saved. Your agent
                    can use the secret but never sees its value.
                </Typography>
            </Stack>
        </form>
    );
}
