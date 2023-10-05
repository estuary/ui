import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Stack, StyledEngineProvider, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import NotDateTime from './NotDateTime';

interface Props {
    collectionName: string;
}

function Filters({ collectionName }: Props) {
    const intl = useIntl();

    const [formData, setFormData] = useState<{
        notBefore: string | undefined;
        notAfter: string | undefined;
    }>({ notBefore: undefined, notAfter: undefined });

    const [schema, uiSchema] = useMemo(() => {
        const schemaVal = {
            properties: {
                notBefore: {
                    description: intl.formatMessage({
                        id: 'notBefore.input.description',
                    }),
                    title: intl.formatMessage({
                        id: 'notBefore.input.label',
                    }),
                    format: 'date-time',
                    type: 'string',
                },
                notAfter: {
                    description: intl.formatMessage({
                        id: 'notAfter.input.description',
                    }),
                    title: intl.formatMessage({
                        id: 'notAfter.input.label',
                    }),
                    format: 'date-time',
                    type: 'string',
                },
            },
            required: [],
            type: 'object',
        };

        return [schemaVal, custom_generateDefaultUISchema(schemaVal)];
    }, [intl]);

    return (
        <Box sx={{ mt: 3 }}>
            <Stack>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row">
                        <Typography variant="h6">
                            <FormattedMessage id="notBeforeNotAfter.header" />
                        </Typography>
                    </Stack>

                    <Typography>
                        <FormattedMessage id="notBeforeNotAfter.message" />
                    </Typography>
                </Stack>

                <StyledEngineProvider injectFirst>
                    <JsonForms
                        readonly={false}
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        validationMode={showValidation()}
                        onChange={(state) => {
                            console.log('setting state', {
                                state,
                                setFormData,
                            });
                        }}
                    />
                </StyledEngineProvider>

                <Stack spacing={2}>
                    <NotDateTime
                        collectionName={collectionName}
                        description={intl.formatMessage({
                            id: 'notBefore.input.description',
                        })}
                        label={intl.formatMessage({
                            id: 'notBefore.input.label',
                        })}
                        period="before"
                    />
                    <NotDateTime
                        collectionName={collectionName}
                        description={intl.formatMessage({
                            id: 'notAfter.input.description',
                        })}
                        label={intl.formatMessage({
                            id: 'notAfter.input.label',
                        })}
                        period="after"
                    />
                </Stack>
            </Stack>
        </Box>
    );
}

export default Filters;
