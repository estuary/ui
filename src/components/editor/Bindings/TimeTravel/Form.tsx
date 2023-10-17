import { StyledEngineProvider } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import { useSnackbar } from 'notistack';
import { snackbarSettings } from 'utils/notification-utils';
import useTimeTravel from './useTimeTravel';

interface Props {
    collectionName: string;
}

function TimeTravelForm({ collectionName }: Props) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const { updateTimeTravel, fullSource } = useTimeTravel(collectionName);

    const [localCopy, setLocalCopy] = useState(fullSource ?? {});

    const startUpdating = useRef(false);

    useEffect(() => {
        startUpdating.current = false;
        setLocalCopy(fullSource ?? {});
        // When the collection name changes we want to basically do a mini-reset of the form state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName]);

    const [schema, uiSchema] = useMemo(() => {
        const schemaVal = {
            additionalProperties: true,
            required: [],
            type: 'object',
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
        };

        return [schemaVal, custom_generateDefaultUISchema(schemaVal)];
    }, [intl]);

    return (
        <StyledEngineProvider injectFirst>
            <JsonForms
                readonly={false}
                schema={schema}
                uischema={uiSchema}
                data={localCopy}
                renderers={defaultRenderers}
                cells={materialCells}
                config={defaultOptions}
                validationMode={showValidation()}
                onChange={async (state) => {
                    if (!startUpdating.current) {
                        startUpdating.current = true;
                        return;
                    }

                    updateTimeTravel(state)
                        .then(() => {})
                        .catch((err) => {
                            enqueueSnackbar(
                                intl.formatMessage({
                                    id:
                                        err === 'no binding'
                                            ? 'notBeforeNotAfter.update.error.noBinding'
                                            : 'notBeforeNotAfter.update.error',
                                }),
                                { ...snackbarSettings, variant: 'error' }
                            );
                        });
                }}
            />
        </StyledEngineProvider>
    );
}

export default TimeTravelForm;
