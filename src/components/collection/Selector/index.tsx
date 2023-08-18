import { Box, Stack, Typography, useTheme } from '@mui/material';
import { defaultOutline } from 'context/Theme';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import BindingsEditorAdd from './Add';
import { CollectionData } from './types';

interface Props {
    AddSelectedButton: ReactNode;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
    selectedCollections: string[] | CollectionData[];
}

function CollectionSelector({
    readOnly = false,
    itemType,
    RediscoverButton,
    AddSelectedButton,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const collectionsLabel =
        itemType ?? intl.formatMessage({ id: 'terms.collections' });

    return (
        <Box>
            <Box sx={{ height: '100%', width: '100%' }}>
                <Stack
                    direction="row"
                    sx={{
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
                            AddSelectedButton={AddSelectedButton}
                        />
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

export default CollectionSelector;
