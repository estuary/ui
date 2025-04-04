import { useMemo, useState } from 'react';

import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';

import { useIntl } from 'react-intl';

import { CATALOG_NAME_SCOPE } from 'src/forms/renderers/CatalogName';
import defaultRenderers from 'src/services/jsonforms/defaultRenderers';
import { defaultOptions, hideValidation } from 'src/services/jsonforms/shared';
import {
    useTransformationCreate_name,
    useTransformationCreate_setName,
} from 'src/stores/TransformationCreate/hooks';

// TODO (transform create) This is not in use right now but should be wired up soon
function TransformationCreateName() {
    const intl = useIntl();

    const entityName = useTransformationCreate_name();
    const setName = useTransformationCreate_setName();

    const schema = useMemo(() => {
        return {
            properties: {
                [CATALOG_NAME_SCOPE]: { type: 'string' },
            },
            required: [CATALOG_NAME_SCOPE],
            type: 'object',
        };
    }, []);

    const uiSchema = {
        elements: [
            {
                elements: [
                    {
                        label: intl.formatMessage({
                            id: 'newTransform.collection.label',
                        }),
                        scope: `#/properties/${CATALOG_NAME_SCOPE}`,
                        type: 'Control',
                    },
                ],
                type: 'HorizontalLayout',
            },
        ],
        type: 'VerticalLayout',
    };

    const [formData] = useState({ entityName });

    const updateDetails = (details: any) => {
        setName(details.entityName);
    };

    return (
        <JsonForms
            schema={schema}
            uischema={uiSchema}
            data={formData}
            renderers={defaultRenderers}
            cells={materialCells}
            config={defaultOptions}
            validationMode={hideValidation()}
            onChange={updateDetails}
        />
    );
}

export default TransformationCreateName;
