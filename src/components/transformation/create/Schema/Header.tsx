import { Typography, useTheme } from '@mui/material';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { WarningCircle } from 'iconoir-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

function DerivationSchemaHeader() {
    const theme = useTheme();

    const currentCatalog = useEditorStore_currentCatalog();

    const schemaUnedited = useMemo(() => {
        if (currentCatalog && Object.hasOwn(currentCatalog.spec, 'schema')) {
            return Object.hasOwn(
                currentCatalog.spec.schema.properties,
                'your_key'
            );
        } else {
            return false;
        }
    }, [currentCatalog]);

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
