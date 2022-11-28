import { JsonSchema } from '@jsonforms/core';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Button, Typography } from '@mui/material';
import { ApiError } from '@supabase/supabase-js';
import AlertBox from 'components/shared/AlertBox';
import { isEmpty } from 'lodash';
import { useSnackbar, VariantType } from 'notistack';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import {
    defaultOptions,
    hideValidation,
    showValidation,
} from 'services/jsonforms/shared';

interface Props {
    onSubmit: Function;
    schema: JsonSchema;
    uiSchema: any; //UISchemaElement
    // If provided, then the form will navigate to this location once `onSubmit` is successful.
    navigateOnSuccess?: string;
}

const MagicLinkInputs = ({
    onSubmit,
    schema,
    uiSchema,
    navigateOnSuccess,
}: Props) => {
    const hasToken = schema.properties?.token;

    const navigate = useNavigate();
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
            if (navigateOnSuccess) {
                navigate(navigateOnSuccess);
            }
        },
    };

    return (
        <>
            {submitError ? (
                <Box
                    sx={{
                        mb: 5,
                    }}
                >
                    <AlertBox severity="error" short>
                        <Typography>{submitError.message}</Typography>
                    </AlertBox>
                </Box>
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
