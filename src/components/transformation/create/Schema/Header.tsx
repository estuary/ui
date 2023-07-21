import { useEffect } from 'react';

import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Typography, useTheme } from '@mui/material';

import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';

import {
    useTransformationCreate_schemaUnedited,
    useTransformationCreate_setSchemaUnedited,
} from 'stores/TransformationCreate/hooks';

function DerivationSchemaHeader() {
    const theme = useTheme();

    // Draft Editor Store
    const currentCatalog = useEditorStore_currentCatalog();

    // Transformation Create Store
    const schemaUnedited = useTransformationCreate_schemaUnedited();
    const setSchemaUnedited = useTransformationCreate_setSchemaUnedited();

    useEffect(() => {
        const templateDetected =
            currentCatalog && Object.hasOwn(currentCatalog.spec, 'schema')
                ? Object.hasOwn(
                      currentCatalog.spec.schema.properties,
                      'your_key'
                  )
                : false;

        setSchemaUnedited(templateDetected);
    }, [setSchemaUnedited, currentCatalog]);

    return (
        <>
            {schemaUnedited ? (
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id="newTransform.schema.header" />
            </Typography>
        </>
    );
}

export default DerivationSchemaHeader;
