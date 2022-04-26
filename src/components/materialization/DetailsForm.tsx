import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { ConnectorTag } from 'components/capture/create';
import useMaterializationCreationStore, {
    CreationFormStatuses,
    CreationState,
} from 'components/materialization/Store';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { StoreSelector } from 'types';

interface Props {
    connectorTags: ConnectorTag[];
}

const stateSelectors: StoreSelector<CreationState> = {
    formData: (state) => state.details.data,
    setDetails: (state) => state.setDetails,
    setConnectors: (state) => state.setConnectors,
    showValidation: (state) => state.formState.showValidation,
    status: (state) => state.formState.status,
};

function NewMaterializationDetails({ connectorTags }: Props) {
    const intl = useIntl();
    const formData = useMaterializationCreationStore(stateSelectors.formData);
    const setDetails = useMaterializationCreationStore(
        stateSelectors.setDetails
    );
    const displayValidation = useMaterializationCreationStore(
        stateSelectors.showValidation
    );
    const status = useMaterializationCreationStore(stateSelectors.status);

    const schema = useMemo(() => {
        return {
            properties: {
                image: {
                    description: intl.formatMessage({
                        id: 'materializationCreation.image.description',
                    }),
                    oneOf:
                        connectorTags.length > 0
                            ? connectorTags.map((connector: any) => {
                                  return {
                                      const: connector.id,
                                      title: connector.connectors.detail,
                                  };
                              })
                            : ([] as { title: string; const: string }[]),
                    type: 'string',
                },
                name: {
                    description: intl.formatMessage({
                        id: 'materializationCreation.name.description',
                    }),
                    maxLength: 1000,
                    minLength: 3,
                    pattern: '^[a-zA-Z0-9_.-]*/[a-zA-Z0-9_.-]+$',
                    type: 'string',
                },
            },
            required: ['name', 'image'],
            type: 'object',
        };
    }, [connectorTags, intl]);

    const uiSchema = {
        elements: [
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'materializationCreation.name.label',
                        }),
                        scope: '#/properties/name',
                        type: 'Control',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'materializationCreation.image.label',
                        }),
                        scope: '#/properties/image',
                        type: 'Control',
                    },
                ],
                type: 'HorizontalLayout',
            },
        ],
        type: 'VerticalLayout',
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
                Materialization Details
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreation.instructions" />
            </Typography>

            <Stack direction="row" spacing={2}>
                {schema.properties.image.oneOf.length > 0 ? (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={status !== CreationFormStatuses.IDLE}
                        validationMode={showValidation(displayValidation)}
                        onChange={setDetails}
                    />
                ) : (
                    <Alert severity="warning">
                        <FormattedMessage id="materializationCreation.missingConnectors" />
                    </Alert>
                )}
            </Stack>
        </Box>
    );
}

export default NewMaterializationDetails;
