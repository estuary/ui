import { Box, Stack, Typography, StyledEngineProvider } from '@mui/material';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import {
    useResourceConfig_fullSourceOfCollectionProperty,
    useResourceConfig_updateFullSourceErrors,
    useResourceConfig_updateFullSourceProperty,
} from 'stores/ResourceConfig/hooks';

interface Props {
    collectionName: string;
}

// Just to make it clear... we make the labels positive so the labels are kind "reversed"
//      "Only Before" controls notAfter
//      "Only After"    controls notBefore
function Filters({ collectionName }: Props) {
    const intl = useIntl();

    const updateFullSourceProperty =
        useResourceConfig_updateFullSourceProperty();
    const updateFullSourceErrors = useResourceConfig_updateFullSourceErrors();

    const notBefore = useResourceConfig_fullSourceOfCollectionProperty(
        collectionName,
        'notBefore'
    );

    const notAfter = useResourceConfig_fullSourceOfCollectionProperty(
        collectionName,
        'notAfter'
    );

    const [formData, setFormData] = useState<{
        notBefore: string | undefined;
        notAfter: string | undefined;
    }>({ notBefore, notAfter });

    const [schema, uiSchema] = useMemo(() => {
        const schemaVal = {
            properties: {
                notAfter: {
                    order: 0,
                    description: intl.formatMessage({
                        id: 'notAfter.input.description',
                    }),
                    title: intl.formatMessage({
                        id: 'notAfter.input.label',
                    }),
                    format: 'date-time',
                    type: 'string',
                },
                notBefore: {
                    order: 1,
                    description: intl.formatMessage({
                        id: 'notBefore.input.description',
                    }),
                    title: intl.formatMessage({
                        id: 'notBefore.input.label',
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
        <Box sx={{ mt: 3, mb: 5 }}>
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

                            updateFullSourceProperty(
                                collectionName,
                                'notBefore',
                                state.data.notBefore
                            );

                            updateFullSourceProperty(
                                collectionName,
                                'notAfter',
                                state.data.notAfter
                            );

                            updateFullSourceErrors(
                                collectionName,
                                state.errors
                            );
                        }}
                    />
                </StyledEngineProvider>
            </Stack>
        </Box>
    );
}

export default Filters;
