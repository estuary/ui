import { useEffect, useMemo, useRef, useState } from 'react';

import { StyledEngineProvider } from '@mui/material';

import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import useTimeTravel from 'src/components/editor/Bindings/TimeTravel/useTimeTravel';
import { custom_generateDefaultUISchema } from 'src/services/jsonforms';
import defaultRenderers from 'src/services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'src/services/jsonforms/shared';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { snackbarSettings } from 'src/utils/notification-utils';

interface Props {
    bindingUUID: string;
    collectionName: string;
}

function TimeTravelForm({ bindingUUID, collectionName }: Props) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const { updateTimeTravel, fullSource } = useTimeTravel(
        bindingUUID,
        collectionName
    );

    const [localCopy, setLocalCopy] = useState(fullSource ?? {});

    const formActive = useFormStateStore_isActive();

    const skipServer = useRef(true);

    useEffect(() => {
        skipServer.current = true;
        setLocalCopy(fullSource ?? {});
        // When the binding UUID changes we want to basically do a mini-reset of the form state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bindingUUID]);

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
                readonly={formActive}
                schema={schema}
                uischema={uiSchema}
                data={localCopy}
                renderers={defaultRenderers}
                cells={materialCells}
                config={defaultOptions}
                validationMode={showValidation()}
                onChange={async (state) => {
                    updateTimeTravel(state, skipServer.current)
                        .then(() => {})
                        .catch((err) => {
                            enqueueSnackbar(
                                intl.formatMessage({
                                    id:
                                        err === 'no binding'
                                            ? 'updateBinding.error.noBinding'
                                            : 'notBeforeNotAfter.update.error',
                                }),
                                { ...snackbarSettings, variant: 'error' }
                            );
                        })
                        .finally(() => {
                            if (skipServer.current) {
                                skipServer.current = false;
                            }
                        });
                }}
            />
        </StyledEngineProvider>
    );
}

export default TimeTravelForm;
