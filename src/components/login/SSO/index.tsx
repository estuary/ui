import type { DefaultLoginProps } from 'src/components/login/types';

import React, { useState } from 'react';

import {
    Box,
    Button,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { useSSOSignIn } from 'src/components/login/SSO/useSSOSignIn';
import AlertBox from 'src/components/shared/AlertBox';
import { hasLength } from 'src/utils/misc-utils';

export const SSOForm = ({ grantToken }: DefaultLoginProps) => {
    const intl = useIntl();

    const { loading, submitError, signIn } = useSSOSignIn(grantToken);

    const [showErrors, setShowErrors] = useState(false);

    const handlers = {
        submit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            // TODO (typing)
            // forcing to any but it really is FormDataInputs
            const formData: any = Object.fromEntries(
                new FormData(event.currentTarget)
            );

            const splitEmail = formData.email.split('@');
            const submittedDomain = splitEmail[1];

            if (!hasLength(submittedDomain)) {
                setShowErrors(true);
                return;
            }

            setShowErrors(false);

            await signIn({ domain: submittedDomain });
        },
    };

    return (
        <Stack direction="column" spacing={3} style={{ width: '100%' }}>
            <Typography>
                {intl.formatMessage({ id: 'login.sso.header' })}
            </Typography>
            {submitError ? (
                <Box>
                    <AlertBox severity="error" short>
                        <Typography>{submitError}</Typography>
                        <Typography>
                            {intl.formatMessage({ id: 'error.tryAgain' })}
                        </Typography>
                    </AlertBox>
                </Box>
            ) : null}

            <Box>
                <form
                    onSubmit={handlers.submit}
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: '100%',
                    }}
                >
                    <TextField
                        autoComplete="email"
                        color={showErrors ? 'error' : undefined}
                        disabled={loading}
                        error={showErrors}
                        fullWidth
                        helperText={intl.formatMessage({
                            id: 'login.companyEmail.description',
                        })}
                        inputProps={{
                            type: 'email',
                        }}
                        label={intl.formatMessage({
                            id: 'login.companyEmail.label',
                        })}
                        name="email"
                        required
                    />

                    <Button
                        disabled={loading}
                        fullWidth
                        name="SSO Sign In"
                        size="large"
                        type="submit"
                        sx={{ mt: 3 }}
                    >
                        {intl.formatMessage({ id: 'cta.login.sso' })}
                    </Button>
                </form>
            </Box>
            <Divider />
            <Box>
                <MessageWithLink messageID="login.sso.message.help" />
            </Box>
        </Stack>
    );
};
