import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Button, Typography } from '@mui/material';
import { ApiError } from '@supabase/supabase-js';
import { useClient } from 'hooks/supabase-swr';
import { isEmpty } from 'lodash';
import { useSnackbar, VariantType } from 'notistack';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    hideValidation,
    showValidation,
} from 'services/jsonforms';

const MagicLink = () => {
    const { enqueueSnackbar } = useSnackbar();
    const supabaseClient = useClient();
    const intl = useIntl();

    const [showErrors, setShowErrors] = useState(false);
    const [loading, setLoading] = useState(false);

    const [submitError, setSubmitError] = useState<ApiError | null>(null);
    const [formData, setFormData] = useState<{ email: string | undefined }>({
        email: undefined,
    });
    const [formErrors, setFormErrors] = useState<any[] | undefined>([]);

    const schema = {
        properties: {
            email: {
                description: intl.formatMessage({
                    id: 'login.email.description',
                }),
                minLength: 5,
                type: 'string',
            },
        },
        required: ['email'],
        type: 'object',
    };

    const uiSchema = {
        elements: [
            {
                label: intl.formatMessage({
                    id: 'login.email.label',
                }),
                scope: `#/properties/email`,
                type: 'Control',
            },
        ],
        type: 'VerticalLayout',
    };

    const displayNotification = (id: string, variant: VariantType) => {
        enqueueSnackbar(
            intl.formatMessage({
                id,
            }),
            {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                variant,
            }
        );
    };

    const handlers = {
        submit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!isEmpty(formErrors) || isEmpty(formData.email)) {
                setShowErrors(true);
                return;
            }

            setSubmitError(null);
            setShowErrors(false);
            setLoading(true);

            const { error } = await supabaseClient.auth.signIn({
                email: formData.email,
            });
            if (error) {
                setSubmitError(error);
                return;
            }

            displayNotification('login.magicLink', 'success');
            setLoading(false);
        },
    };

    return (
        <>
            {submitError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 5,
                    }}
                >
                    <Typography>{submitError.message}</Typography>
                </Alert>
            )}

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
                    readonly={loading}
                    schema={schema}
                    uischema={uiSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    validationMode={
                        showErrors ? showValidation() : hideValidation()
                    }
                    onChange={(state) => {
                        setFormData(state.data);
                        setFormErrors(state.errors);
                    }}
                />

                <Button
                    type="submit"
                    sx={{
                        mt: 2,
                    }}
                >
                    <FormattedMessage id="cta.magicLink" />
                </Button>
            </form>
        </>
    );
};

export default MagicLink;
