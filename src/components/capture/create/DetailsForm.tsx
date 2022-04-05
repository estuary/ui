import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Stack, Typography } from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';

interface NewCaptureDetailsProps {
    connectorTags: any[];
}

const stateSelectors = {
    formData: (state: CaptureCreationState) => state.details.data,
    setDetails: (state: CaptureCreationState) => state.setDetails,
    setConnectors: (state: CaptureCreationState) => state.setConnectors,
    showValidation: (state: CaptureCreationState) =>
        state.formState.showValidation,
    saving: (state: CaptureCreationState) => state.formState.saving,
    testing: (state: CaptureCreationState) => state.formState.testing,
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const { connectorTags } = props;

    const intl = useIntl();
    const formData = useCaptureCreationStore(stateSelectors.formData);
    const setDetails = useCaptureCreationStore(stateSelectors.setDetails);
    const displayValidation = useCaptureCreationStore(
        stateSelectors.showValidation
    );
    const saving = useCaptureCreationStore(stateSelectors.saving);
    const testing = useCaptureCreationStore(stateSelectors.testing);

    const schema = useMemo(() => {
        return {
            properties: {
                image: {
                    description: intl.formatMessage({
                        id: 'captureCreation.image.description',
                    }),
                    oneOf:
                        connectorTags.length > 0
                            ? connectorTags.map((connector: any) => {
                                  return {
                                      const: connector.id,
                                      title: connector.connectors.image_name,
                                  };
                              })
                            : ([] as { title: string; const: string }[]),
                    type: 'string',
                },
                name: {
                    description: intl.formatMessage({
                        id: 'captureCreation.name.description',
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
                            id: 'captureCreation.name.label',
                        }),
                        scope: '#/properties/name',
                        type: 'Control',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'captureCreation.image.label',
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
        <>
            <Typography variant="h5">Capture Details</Typography>

            <FormattedMessage id="captureCreation.instructions" />

            <Stack direction="row" spacing={2}>
                {schema.properties.image.oneOf.length > 0 ? (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={saving || testing}
                        validationMode={showValidation(displayValidation)}
                        onChange={setDetails}
                    />
                ) : (
                    <Alert severity="warning">
                        <FormattedMessage id="captureCreation.missingConnectors" />
                    </Alert>
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
