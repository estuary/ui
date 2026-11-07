import type { CollectionSelectorProps } from 'src/components/collection/Selector/types';

import { Stack, Typography, useTheme } from '@mui/material';

import BindingsEditorAdd from 'src/components/collection/Selector/Add';
import { defaultOutline } from 'src/context/Theme';

function CollectionSelector({
    readOnly = false,
    itemType,
    RediscoverButton,
    AddSelectedButton,
    selectedCollections,
}: CollectionSelectorProps) {
    const theme = useTheme();

    const collectionsLabel = itemType ?? 'Collections';

    return (
        <Stack
            direction="row"
            sx={{
                flex: 0,
                justifyContent: 'space-between',
                borderBottom: defaultOutline[theme.palette.mode],
            }}
        >
            <Typography
                component="div"
                sx={{
                    p: 1,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                }}
            >
                {collectionsLabel}
            </Typography>

            <Stack direction="row">
                {RediscoverButton}

                <BindingsEditorAdd
                    disabled={readOnly}
                    selectedCollections={selectedCollections}
                    AddSelectedButton={AddSelectedButton}
                />
            </Stack>
        </Stack>
    );
}

export default CollectionSelector;
