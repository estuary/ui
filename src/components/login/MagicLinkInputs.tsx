import { JsonSchema } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Button, Typography } from '@mui/material';
import { ApiError } from '@supabase/supabase-js';
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

interface Props {
    onSubmit: Function;
    schema: JsonSchema;
    uiSchema: any; //UISchemaElement
}

const MagicLinkInputs = ({ onSubmit, schema, uiSchema }: Props) => {
    const hasToken = schema.properties?.token;

    const { enqueueSnackbar } = useSnackbar();
    const intl = useIntl();

    const [showErrors, setShowErrors] = useState(false);
    const [loading, setLoading] = useState(false);

    const [submitError, setSubmitError] = useState<ApiError | null>(null);
    const [formData, setFormData] = useState<{
        email: string | undefined;
        token?: string | undefined;
    }>(
        hasToken
            ? {
                  email: undefined,
                  token: undefined,
              }
            : {
                  email: undefined,
              }
    );
    const [formErrors, setFormErrors] = useState<any[] | undefined>([]);

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
            if (
                !isEmpty(formErrors) ||
                isEmpty(formData.email) ||
                (hasToken && isEmpty(formData.token))
            ) {
                setShowErrors(true);
                return;
            }

            setSubmitError(null);
            setShowErrors(false);
            setLoading(true);

            const { error } = await onSubmit(formData).finally(() => {
                setLoading(false);
            });

            if (error) {
                setSubmitError(error);
                return;
            }

            if (!hasToken) {
                displayNotification('login.magicLink', 'success');
            }
        },
    };

    return (
        <>
            {submitError ? (
                <Alert
                    severity="error"
                    sx={{
                        mb: 5,
                    }}
                >
                    <Typography>{submitError.message}</Typography>
                </Alert>
            ) : null}

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

                <Button type="submit" sx={{ mt: 3 }}>
                    <FormattedMessage
                        id={hasToken ? 'cta.verifyOTP' : 'cta.magicLink'}
                    />
                </Button>
            </form>
        </>
    );
};

export default MagicLinkInputs;
