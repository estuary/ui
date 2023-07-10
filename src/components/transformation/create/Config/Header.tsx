import { Typography, useTheme } from '@mui/material';
import { useEditorStore_invalidEditors } from 'components/editor/Store/hooks';
import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_shuffleKeyErrorsExist } from 'stores/TransformationCreate/hooks';

function DerivationCatalogHeader() {
    const theme = useTheme();

    // Draft Editor Store
    const invalidEditors = useEditorStore_invalidEditors();

    // Transformation Create Store
    const shuffleKeyErrorsExist =
        useTransformationCreate_shuffleKeyErrorsExist();

    return (
        <>
            {shuffleKeyErrorsExist ? (
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : invalidEditors.length > 0 ? (
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.warning[theme.palette.mode],
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id="newTransform.config.header" />
            </Typography>
        </>
    );
}

export default DerivationCatalogHeader;
