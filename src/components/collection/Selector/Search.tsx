import { AutocompleteChangeReason, Box } from '@mui/material';
import BindingsEditorAdd from 'components/editor/Bindings_UnderDev/Add';
import { useIntl } from 'react-intl';
import { CollectionData } from './types';

interface Props {
    options: any[];
    onChange: (collections: string[], reason: AutocompleteChangeReason) => void;
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
    const collectionsLabel = intl.formatMessage(
        {
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        },
        {
            items: itemType ?? intl.formatMessage({ id: 'terms.collections' }),
        }
    );

    const handlers = {
        updateCollections: (value: string[]) => {
            onChange(value, 'selectOption');
        },
    };

    return (
        <Box
            sx={{
                p: '0.5rem 0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <BindingsEditorAdd
                disabled={readOnly}
                title={collectionsLabel}
                onChange={handlers.updateCollections}
            />
        </Box>
    );
}

export default CollectionSelectorSearch;
