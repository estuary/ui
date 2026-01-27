import type { ErrorIndicatorProps } from 'src/components/editor/Bindings/Row/types';

import { Typography, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';

import {
    useBinding_collectionMetadataProperty,
    useBinding_fullSourceOfBindingProperty,
    useBinding_hasFieldConflicts,
    useBinding_resourceConfigOfBindingProperty,
} from 'src/stores/Binding/hooks';

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

    const fieldConflictsExist = useBinding_hasFieldConflicts(bindingUUID);

    const sourceBackfillRecommended = useBinding_collectionMetadataProperty(
        collection,
        'sourceBackfillRecommended'
    );

    const errorExists =
        (bindingErrors && bindingErrors.length > 0) ||
        (configErrors && configErrors.length > 0) ||
        fieldConflictsExist;

    if (errorExists || Boolean(sourceBackfillRecommended)) {
        return (
            <Typography>
                <WarningCircle
                    style={{
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
