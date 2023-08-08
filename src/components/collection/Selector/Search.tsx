import {
    AutocompleteChangeReason,
    Box,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { SelectedCollectionChangeData } from 'components/editor/Bindings2/types';
import BindingsEditorAdd from 'components/editor/Bindings_UnderDev/Add';
import { useEntityType } from 'context/EntityContext';
import { defaultOutline } from 'context/Theme';
import { useIntl } from 'react-intl';
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
}

function CollectionSelectorSearch({
    onChange,
    readOnly = false,
    itemType,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const entityType = useEntityType();

    // Captures can only disable/enable bindings in the UI. The user can
    //   actually remove items from the list via the CLI and we are okay
    //   with not handling that scenario in the UI as of Q3 2023
    const disableAdd = entityType === 'capture';

    const collectionsLabel =
        itemType ?? intl.formatMessage({ id: 'terms.collections' });

    return (
        <Box
            sx={{
                pb: 1,
            }}
        >
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

                    {disableAdd ? null : (
                        <BindingsEditorAdd
                            disabled={readOnly}
                            onChange={(value) => {
                                onChange(value, 'selectOption');
                            }}
                        />
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

export default CollectionSelectorSearch;
