import { JsonFormsCore } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Button, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import FullPageDialog from 'components/fullPage/Dialog';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { defaultOptions, defaultRenderers } from 'services/jsonforms';
import { getUserDetails } from 'services/supabase';

const PasswordReset = () => {
    useBrowserTitle('browserTitle.passwordReset');

    const [searchParams] = useSearchParams();
    const accessToken = searchParams.get('access_token');

    const supabaseClient = useClient();
    const intl = useIntl();
    const { user } = Auth.useUser();

    const { email: authEmail } = getUserDetails(user);

    const [formData, setFormData] = useState({
        email: authEmail,
        password: '',
    });

    const [formState, setFormState] = useState<
        Pick<JsonFormsCore, 'data' | 'errors'>
    >({
        data: {
            email: '',
            password: '',
        },
        errors: [],
    });

    const schema = {
        properties: {
            email: {
                description: intl.formatMessage({
                    id: 'email.description',
                }),
                type: 'string',
            },
            password: {
                description: intl.formatMessage({
                    id: 'password.description',
                }),
                type: 'string',
            },
        },
        required: ['email', 'password'],
        type: 'object',
    };

    const uiSchema = {
        elements: [
            {
                label: intl.formatMessage({
                    id: 'email.label',
                }),
                scope: `#/properties/email`,
                type: 'Control',
                options: {
                    readonly: true,
                },
            },
            {
                label: intl.formatMessage({
                    id: 'password.label',
                }),
                scope: `#/properties/password`,
                type: 'Control',
                options: {
                    format: 'password',
                },
            },
        ],
        type: 'VerticalLayout',
    };

    const handlers = {
        submit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            console.log('Submit password reset', {
                formState,
            });

            const res = await supabaseClient.auth.api.updateUser(
                accessToken ?? '__missing__',
                {
                    password: formState.data.password,
                }
            );

            console.log('Response from update =', res);

            if (res.error) {
                throw new Error('Unable to update password');
            } else {
                throw new Error('Updated Password');
            }
        },
    };

    return (
        <FullPageDialog>
            <>
                <Box
                    sx={{
                        mb: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" align="center" sx={{ mb: 1.5 }}>
                        <FormattedMessage id="register.heading" />
                    </Typography>

                    <FormattedMessage id="register.main.message" />
                </Box>

                <form
                    onSubmit={handlers.submit}
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        onChange={(state) => {
                            console.log('Made a call!', {
                                state,
                                setFormData,
                            });
                            setFormData(state.data);
                            setFormState(state);
                        }}
                    />

                    <Button type="submit">
                        <FormattedMessage id="cta.resetPassword" />
                    </Button>
                </form>
            </>
        </FullPageDialog>
    );
};

export default PasswordReset;
