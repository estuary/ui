import { Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import { useResourceConfig_resourceConfigOfCollectionProperty } from 'stores/ResourceConfig/hooks';
import { useBindingsEditorStore_fullSourceOfCollectionProperty } from '../Store/hooks';

interface Props {
    collection: string;
}

function BindingsSelectorErrorIndicator({ collection }: Props) {
    const theme = useTheme();

    const configErrors = useResourceConfig_resourceConfigOfCollectionProperty(
        collection,
        'errors'
    );

    const bindingErrors = useBindingsEditorStore_fullSourceOfCollectionProperty(
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
