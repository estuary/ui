import {
    AutocompleteChangeReason,
    Box,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { SelectedCollectionChangeData } from 'components/editor/Bindings2/types';
import BindingsEditorAdd from 'components/editor/Bindings_UnderDev/Add';
import BindingsEditorRediscover from 'components/editor/Bindings_UnderDev/Rediscover';
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

    // Captures are the only ones that show the refresh button. This
    //  kicks off running a new discover to check for new collections
    const showRefresh = entityType === 'capture';

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

                    <Stack direction="row">
                        {showRefresh ? (
                            <BindingsEditorRediscover
                                entityType="capture"
                                disabled={false}
                                callFailed={undefined}
                                postGenerateMutate={undefined}
                            />
                        ) : null}

                        <BindingsEditorAdd
                            disabled={readOnly}
                            onChange={(value) => {
                                onChange(value, 'selectOption');
                            }}
                        />
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

export default CollectionSelectorSearch;
