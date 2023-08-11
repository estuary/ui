import {
    AutocompleteChangeReason,
    Box,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { SelectedCollectionChangeData } from 'components/editor/Bindings/types';
import { defaultOutline } from 'context/Theme';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import BindingsEditorAdd from './Add';
import { CollectionData } from './types';

interface Props {
    options: any[];
    onChange: (
        collections: SelectedCollectionChangeData[],
        reason: AutocompleteChangeReason
    ) => void;
    selectedCollections: string[] | CollectionData[];
    itemType?: string;
    getValue?: (option: any) => string;
    readOnly?: boolean;
    AutocompleteProps?: any; // TODO (typing) - need to typ as props
    RediscoverButton?: ReactNode;
}

function CollectionSelectorSearch({
    onChange,
    readOnly = false,
    itemType,
    RediscoverButton,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const collectionsLabel =
        itemType ?? intl.formatMessage({ id: 'terms.collections' });

    console.log('CollectionSelectorSearch', RediscoverButton);

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
                            onChange={(value) =>
                                onChange(value, 'selectOption')
                            }
                        />
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

export default CollectionSelectorSearch;
