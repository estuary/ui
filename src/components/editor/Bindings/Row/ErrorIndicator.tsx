import { Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import {
    useBinding_collectionMetadataProperty,
    useBinding_fullSourceOfBindingProperty,
    useBinding_resourceConfigOfBindingProperty,
} from 'stores/Binding/hooks';
import type { ErrorIndicatorProps } from './types';

function BindingsSelectorErrorIndicator({
    bindingUUID,
    collection,
}: ErrorIndicatorProps) {
    const theme = useTheme();

    const configErrors = useBinding_resourceConfigOfBindingProperty(
        bindingUUID,
        'errors'
    );

    const bindingErrors = useBinding_fullSourceOfBindingProperty(
        bindingUUID,
        'errors'
    );

    const sourceBackfillRecommended = useBinding_collectionMetadataProperty(
        collection,
        'sourceBackfillRecommended'
    );

    const errorExists = bindingErrors?.length > 0 || configErrors?.length > 0;

    if (errorExists || Boolean(sourceBackfillRecommended)) {
        return (
            <Typography>
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: errorExists
                            ? theme.palette.error.main
                            : theme.palette.warning.main,
                    }}
                />
            </Typography>
        );
    }

    return null;
}

export default BindingsSelectorErrorIndicator;
