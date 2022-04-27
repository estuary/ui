import { Typography } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import { ConnectorTag } from 'components/capture/create';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/Store';
import { useEffect, useMemo } from 'react';
import {
    FormContainer,
    SelectElement,
    TextFieldElement,
} from 'react-hook-form-mui';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { StoreSelector } from 'types';
import { getConnectorName } from 'utils/misc-utils';

interface Props {
    connectorTags: ConnectorTag[];
}

const stateSelectors: StoreSelector<CaptureCreationState> = {
    formData: (state) => state.details.data,
    setDetails: (state) => state.setDetails,
    setConnectors: (state) => state.setConnectors,
    showValidation: (state) => state.formState.showValidation,
    status: (state) => state.formState.status,
};

function NewCaptureDetails({ connectorTags }: Props) {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const connectorID = searchParams.get(
        routeDetails.capture.create.params.connectorID
    );

    // const formData = useCaptureCreationStore(stateSelectors.formData);
    const setDetails = useCaptureCreationStore(stateSelectors.setDetails);
    // const displayValidation = useCaptureCreationStore(
    //     stateSelectors.showValidation
    // );
    // const status = useCaptureCreationStore(stateSelectors.status);

    useEffect(() => {
        if (connectorID) {
            setDetails({
                data: {
                    name: '',
                    image: connectorID,
                },
            });
        }
    }, [connectorID, setDetails]);

    const connectorOptions = useMemo(() => {
        return connectorTags.length > 0
            ? connectorTags.map((connector) => {
                  return {
                      id: connector.id,
                      title: getConnectorName(connector),
                  };
              })
            : ([] as { title: string; id: string }[]);
    }, [connectorTags]);

    // const schema = useMemo(() => {
    //     return {
    //         properties: {
    //             image: {
    //                 description: intl.formatMessage({
    //                     id: 'captureCreation.image.description',
    //                 }),
    //                 oneOf:
    //                     connectorTags.length > 0
    //                         ? connectorTags.map((connector) => {
    //                               return {
    //                                   const: connector.id,
    //                                   title: getConnectorName(connector),
    //                               };
    //                           })
    //                         : ([] as { title: string; const: string }[]),
    //                 type: 'string',
    //             },
    //             name: {
    //                 description: intl.formatMessage({
    //                     id: 'captureCreation.name.description',
    //                 }),
    //                 maxLength: 1000,
    //                 minLength: 3,
    //                 pattern: '^[a-zA-Z0-9_.-]*/[a-zA-Z0-9_.-]+$',
    //                 type: 'string',
    //             },
    //         },
    //         required: ['name', 'image'],
    //         type: 'object',
    //     };
    // }, [connectorTags, intl]);

    // const uiSchema = {
    //     elements: [
    //         {
    //             elements: [
    //                 {
    //                     label: intl.formatMessage({
    //                         id: 'captureCreation.name.label',
    //                     }),
    //                     scope: '#/properties/name',
    //                     type: 'Control',
    //                 },
    //                 {
    //                     label: intl.formatMessage({
    //                         id: 'captureCreation.image.label',
    //                     }),
    //                     scope: '#/properties/image',
    //                     type: 'Control',
    //                 },
    //             ],
    //             type: 'HorizontalLayout',
    //         },
    //     ],
    //     type: 'VerticalLayout',
    // };

    const handlers = {
        changeImage: (newVal: any) => {
            setDetails({
                data: {
                    image: newVal.id,
                    name: 'foo/foo',
                },
            });
        },
        submit: () => {
            console.log('hey oh');
        },
    };

    const initialValue = { image: '', name: '' };

    return (
        <>
            <Typography variant="h5">Capture Details</Typography>

            <FormattedMessage id="captureCreation.instructions" />

            <FormContainer
                defaultValues={initialValue}
                onSuccess={(data) => {
                    console.log(data);
                    handlers.submit();
                }}
            >
                <TextFieldElement
                    name="name"
                    label={intl.formatMessage({
                        id: 'captureCreation.name.label',
                    })}
                    helperText={intl.formatMessage({
                        id: 'captureCreation.name.description',
                    })}
                    required
                />

                <SelectElement
                    name="image"
                    type="string"
                    label={intl.formatMessage({
                        id: 'captureCreation.image.label',
                    })}
                    helperText={intl.formatMessage({
                        id: 'captureCreation.image.description',
                    })}
                    required
                    options={connectorOptions}
                    objectOnChange
                    onChange={handlers.changeImage}
                />
            </FormContainer>

            {/* <Stack direction="row" spacing={2}>
                {schema.properties.image.oneOf.length > 0 ? (
                    <JsonForms
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
                        readonly={status !== CaptureCreationFormStatus.IDLE}
                        validationMode={showValidation(displayValidation)}
                        onChange={setDetails}
                    />
                ) : (
                    <Alert severity="warning">
                        <FormattedMessage id="captureCreation.missingConnectors" />
                    </Alert>
                )}
            </Stack> */}
        </>
    );
}

export default NewCaptureDetails;
