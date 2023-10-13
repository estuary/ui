import { StyledEngineProvider } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import { useStore } from 'zustand';
import invariableStores from 'context/Zustand/invariableStores';
import { FullSource } from '../Store/types';
import useTimeTravel from './useTimeTravel';

interface Props {
    collectionName: string;
}

// Just to make it clear... we make the labels positive so the labels are kind "reversed"
//      "Only Before" controls notAfter
//      "Only After"    controls notBefore
function TimeTravelForm({ collectionName }: Props) {
    const intl = useIntl();

    const startUpdating = useRef(false);

    const updateDraft = useTimeTravel(collectionName);

    const [notAfter, notBefore] = useStore(
        invariableStores.general_bindings_editor,
        (state) => {
            const binding = state.fullSourceConfigs[collectionName];

            return [binding.notAfter, binding.notBefore];
        }
    );

    console.log('fullSource', { notBefore, notAfter });

    const [formData, setFormData] = useState<FullSource>({
        notBefore,
        notAfter,
    });

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
    );
}

export default TimeTravelForm;
