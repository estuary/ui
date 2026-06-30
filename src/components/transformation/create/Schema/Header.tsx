import { useEffect } from 'react';

import { Typography, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import {
    useTransformationCreate_schemaUnedited,
    useTransformationCreate_setSchemaUnedited,
} from 'src/stores/TransformationCreate/hooks';

function DerivationSchemaHeader() {
    const intl = useIntl();
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

            <Typography component="span" variant="subtitle1">
                {intl.formatMessage({ id: 'newTransform.schema.header' })}
            </Typography>
        </>
    );
}

export default DerivationSchemaHeader;
