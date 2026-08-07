import type { ErrorDetails } from 'src/components/shared/Error/types';

import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useCreateRefreshToken } from 'src/api/gql/refreshTokens';
import SingleLineCode from 'src/components/content/SingleLineCode';
import AlertBox from 'src/components/shared/AlertBox';
import Error from 'src/components/shared/Error';
import { hasLength } from 'src/utils/misc-utils';

const TOKEN_VALIDITY = 'P1Y';

// The shared Error component renders `message` verbatim when the error object
// carries a `code` or `networkError`; otherwise it treats the message as an
// i18n key. This client-side error sets a sentinel code so its inlined copy is
// shown directly.
const TOKEN_DISPLAY_ERROR: ErrorDetails = {
    message:
        'An issue was encountered displaying your token. Please generate a new token.',
    code: 'token_display_failed',
};

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateRefreshTokenDialog({ open, onClose, onCreated }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const [label, setLabel] = useState('');
    const [token, setToken] = useState('');
    const [serverError, setServerError] = useState<ErrorDetails>(null);

    const [{ fetching: generating }, createRefreshToken] =
        useCreateRefreshToken();

    const resetDialog = () => {
        setLabel('');
        setToken('');
        setServerError(null);
    };

    const generateToken = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setServerError(null);

        const result = await createRefreshToken({
            multiUse: true,
            validFor: TOKEN_VALIDITY,
            detail: label,
        });

        if (result.error || !result.data?.createRefreshToken) {
            setServerError(result.error ?? TOKEN_DISPLAY_ERROR);

            return;
        }

        const { id, secret } = result.data.createRefreshToken;

        // The refresh token ID and secret are needed by Flow, therefore it was decided
        // to base64 encode the data returned in the response and present that as the
        // one-time secret presented to the user.
        const encodedToken = Buffer.from(
            JSON.stringify({ id, secret })
        ).toString('base64');

        if (!hasLength(encodedToken)) {
            setServerError(TOKEN_DISPLAY_ERROR);

            return;
        }

        setToken(encodedToken);
        onCreated();
    };

    return (
        <Dialog
            open={open}
            onClose={token || generating ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            aria-label="Create Personal Token"
            slotProps={{
                transition: {
                    onExited: resetDialog,
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">Create Personal Token</Typography>

                <IconButton disabled={generating} onClick={onClose}>
                    <Xmark
                        aria-label={intl.formatMessage({ id: 'cta.close' })}
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ mb: 1 }}>
                    {serverError ? (
                        <Error severity="error" error={serverError} condensed />
                    ) : null}

                    {token ? (
                        <AlertBox severity="info" short data-private>
                            <Typography sx={{ mb: 1 }}>
                                Copy this personal token now - you won’t be able
                                to see it again!
                            </Typography>

                            <SingleLineCode value={token} />
                        </AlertBox>
                    ) : (
                        <Stack
                            component="form"
                            direction="row"
                            onSubmit={generateToken}
                            spacing={2}
                            sx={{ pt: 1 }}
                        >
                            <TextField
                                label="Label"
                                autoFocus
                                onChange={(event) =>
                                    setLabel(event.target.value)
                                }
                                required
                                size="small"
                                sx={{ flex: 1 }}
                                value={label}
                                variant="outlined"
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 3 },
                                    },
                                }}
                            />

                            <Button
                                disabled={!hasLength(label) || generating}
                                loading={generating}
                                type="submit"
                                variant="contained"
                            >
                                Create
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
