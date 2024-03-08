import { Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import {
    useBinding_fullSourceOfCollectionProperty,
    useBinding_resourceConfigOfCollectionProperty,
} from 'stores/Binding/hooks';

interface Props {
    bindingUUID: string;
    collection: string;
}

function BindingsSelectorErrorIndicator({ bindingUUID, collection }: Props) {
    const theme = useTheme();

    const configErrors = useBinding_resourceConfigOfCollectionProperty(
        bindingUUID,
        'errors'
    );

    const bindingErrors = useBinding_fullSourceOfCollectionProperty(
        collection,
        'errors'
    );

    if (bindingErrors?.length > 0 || configErrors?.length > 0) {
        return (
            <Typography>
                <WarningCircle
                    style={{
                        marginRight: 4,
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            </Typography>
        );
    }

    return null;
}

export default BindingsSelectorErrorIndicator;
