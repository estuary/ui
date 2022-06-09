import { createAjv, JsonFormsCore } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Button, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import FullPageDialog from 'components/fullPage/Dialog';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { isEmpty } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { defaultAjvSettings } from 'services/ajv';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { getUserDetails } from 'services/supabase';

const PasswordReset = () => {
    useBrowserTitle('browserTitle.passwordReset');

    const { enqueueSnackbar } = useSnackbar();
    const supabaseClient = useClient();
    const intl = useIntl();

    const { user, session } = Auth.useUser();
    const { email: authEmail } = getUserDetails(user);

    const showErrors = useRef(false);

    const [formData, setFormData] = useState({
        email: authEmail,
        password: null,
    });

    const [formState, setFormState] = useState<
        Pick<JsonFormsCore, 'data' | 'errors'>
    >({
        data: formData,
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
                minLength: 7,
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

            if (!isEmpty(formState.errors)) {
                showErrors.current = true;
            } else {
                showErrors.current = false;

                const res = await supabaseClient.auth.api.updateUser(
                    session?.access_token ?? '__unknown__',
                    {
                        password: formState.data.password,
                    }
                );

                console.log('Response from update =', res);

                if (res.error) {
                    throw new Error('Unable to update password');
                } else {
                    await supabaseClient.auth
                        .signOut()
                        .then(() => {
                            enqueueSnackbar(
                                intl.formatMessage({
                                    id: 'login.passwordReset',
                                }),
                                {
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                    variant: 'success',
                                }
                            );
                        })
                        .catch(() => {});
                }
            }
        },
    };

    const ajv = createAjv({
        ...defaultAjvSettings,
        allErrors: true,
        $data: true,
    });

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
                        <FormattedMessage id="passwordReset.heading" />
                    </Typography>

                    <FormattedMessage id="passwordReset.main" />
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
                        ajv={ajv}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        validationMode={
                            showErrors.current ? showValidation() : undefined
                        }
                        onChange={(state) => {
                            console.log('Made a call!', {
                                state,
                                setFormData,
                            });
                            setFormData(state.data);
                            setFormState(state);
                        }}
                    />

                    <Button
                        type="submit"
                        sx={{
                            mt: 2,
                        }}
                    >
                        <FormattedMessage id="cta.resetPassword" />
                    </Button>
                </form>
            </>
        </FullPageDialog>
    );
};

export default PasswordReset;
