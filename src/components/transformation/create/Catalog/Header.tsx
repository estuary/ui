import { Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_shuffleKeyErrorsExist } from 'stores/TransformationCreate/hooks';

function DerivationCatalogHeader() {
    const theme = useTheme();

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
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id="newTransform.editor.catalog.header" />
            </Typography>
        </>
    );
}

export default DerivationCatalogHeader;
