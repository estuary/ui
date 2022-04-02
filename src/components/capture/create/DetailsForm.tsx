import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Alert, Skeleton, Stack } from '@mui/material';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import useSupabase from 'hooks/useSupabase';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    defaultOptions,
    defaultRenderers,
    showValidation,
} from 'services/jsonforms';
import { supabase } from 'services/supabase';

type NewCaptureDetailsProps = {
    displayValidation: boolean;
    readonly: boolean;
};

const stateSelectors = {
    formData: (state: CaptureCreationState) => state.details.data,
    setDetails: (state: CaptureCreationState) => state.setDetails,
    setHasConnectors: (state: CaptureCreationState) => state.setHasConnectors,
};

const connectorsQuery = () => {
    return supabase
        .from('connector_tags')
        .select(
            `endpoint_spec_schema, documentation_url, id, image_tag, connectors(id,image_name)`
        )
        .eq('protocol', 'capture');

    // TODO (supabase) - how do we order by the image name here?
};

function NewCaptureDetails(props: NewCaptureDetailsProps) {
    const intl = useIntl();
    const { readonly, displayValidation } = props;

    const formData = useCaptureCreationStore(stateSelectors.formData);
    const setDetails = useCaptureCreationStore(stateSelectors.setDetails);
    const setHasConnectors = useCaptureCreationStore(
        stateSelectors.setHasConnectors
    );

    const {
        data: connectorsData,
        isError,
        isSuccess,
        error,
    } = useSupabase(connectorsQuery);

    console.log('supabase stuff', {
        connectorsData,
        isError,
        isSuccess,
        error,
    });

    const [isPostProcessingDone, setPostProcessingDone] = useState(false);
    const [schema, setSchema] = useState({
        properties: {
            image: {
                description: intl.formatMessage({
                    id: 'captureCreation.image.description',
                }),
                oneOf: [] as { title: string; const: string }[],
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
    });
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

    useEffect(() => {
        if (isSuccess) {
            if (connectorsData && connectorsData.length > 0) {
                setSchema((previous: typeof schema) => {
                    const listOfConnectors = connectorsData.map((connector) => {
                        return {
                            const: connector.id,
                            title: connector.connectors.image_name,
                        };
                    });
                    previous.properties.image.oneOf = listOfConnectors;

                    return previous;
                });
                setHasConnectors(true);
            }

            setPostProcessingDone(true);
        }
    }, [connectorsData, isSuccess, setHasConnectors, setPostProcessingDone]);

    return (
        <>
            <FormattedMessage id="captureCreation.instructions" />

            <Stack direction="row" spacing={2}>
                {isPostProcessingDone ? (
                    schema.properties.image.oneOf.length > 0 ? (
                        <JsonForms
                            schema={schema}
                            uischema={uiSchema}
                            data={formData}
                            renderers={defaultRenderers}
                            cells={materialCells}
                            config={defaultOptions}
                            readonly={readonly}
                            validationMode={showValidation(displayValidation)}
                            onChange={setDetails}
                        />
                    ) : (
                        <Alert severity="warning">
                            <FormattedMessage id="captureCreation.missingConnectors" />
                            {schema.properties.image.oneOf.length}
                        </Alert>
                    )
                ) : isError ? (
                    error
                ) : (
                    <>
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width="50%"
                        />
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            width="50%"
                        />
                    </>
                )}
            </Stack>
        </>
    );
}

export default NewCaptureDetails;
