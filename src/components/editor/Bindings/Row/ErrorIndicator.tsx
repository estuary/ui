import { Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import {
    useBinding_fullSourceOfBindingProperty,
    useBinding_resourceConfigOfBindingProperty,
    useBinding_resourceConfigOfMetaBindingProperty,
} from 'stores/Binding/hooks';

interface Props {
    bindingUUID: string;
}

function BindingsSelectorErrorIndicator({ bindingUUID }: Props) {
    const theme = useTheme();

    const configErrors = useBinding_resourceConfigOfBindingProperty(
        bindingUUID,
        'errors'
    );

    const bindingErrors = useBinding_fullSourceOfBindingProperty(
        bindingUUID,
        'errors'
    );

    const sourceBackfillRecommended =
        useBinding_resourceConfigOfMetaBindingProperty(
            bindingUUID,
            'sourceBackfillRecommended'
        );

    if (
        bindingErrors?.length > 0 ||
        configErrors?.length > 0 ||
        Boolean(sourceBackfillRecommended)
    ) {
        return (
            <Typography>
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color:
                            bindingErrors?.length > 0 ||
                            configErrors?.length > 0
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
