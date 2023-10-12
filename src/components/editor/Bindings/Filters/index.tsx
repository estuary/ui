import { Box, Stack, Typography, StyledEngineProvider } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import { useBindingsEditorStore_fullSourceOfCollectionProperty } from '../Store/hooks';
import useTimeTravel from './useTimeTravel';

interface Props {
    collectionName: string;
}

// Just to make it clear... we make the labels positive so the labels are kind "reversed"
//      "Only Before" controls notAfter
//      "Only After"    controls notBefore
function Filters({ collectionName }: Props) {
    const intl = useIntl();

    const startUpdating = useRef(false);

    const updateDraft = useTimeTravel(collectionName);

    const notBefore = useBindingsEditorStore_fullSourceOfCollectionProperty(
        collectionName,
        'notBefore'
    );
    const notAfter = useBindingsEditorStore_fullSourceOfCollectionProperty(
        collectionName,
        'notBefore'
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
                        onChange={async (state) => {
                            if (!startUpdating.current) {
                                startUpdating.current = true;
                                return;
                            }

                            setFormData(state.data);
                            await updateDraft(state.data);
                        }}
                    />
                </StyledEngineProvider>
            </Stack>
        </Box>
    );
}

export default Filters;
