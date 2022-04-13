import { List, ListItemButton, ListItemText } from '@mui/material';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from 'supabase-swr';

type Props = {
    draftId: string;
};

interface DraftSpecFileList {
    catalog_name: string;
    spec_type: string;
    draft_id: string;
}

const DRAFT_SPECS_FILE_LIST_QUERY = `
    catalog_name,
    spec_type,
    draft_id
`;

function EditorFileSelector({ draftId }: Props) {
    const setCurrentCatalog = useEditorStore(
        editorStoreSelectors.setCurrentCatalog
    );
    const currentCatalog = useEditorStore(editorStoreSelectors.currentCatalog);

    const draftSpecQuery = useQuery<DraftSpecFileList>(
        TABLES.DRAFT_SPECS,
        {
            columns: DRAFT_SPECS_FILE_LIST_QUERY,
            filter: (query) => query.eq('draft_id', draftId),
        },
        []
    );
    const { data } = useSelect(draftSpecQuery, {});
    const draftsFileList: DraftSpecFileList[] = data ? data.data : [];

    return (
        <List dense disablePadding>
            {draftsFileList.length > 0 ? (
                draftsFileList.map((tag: any) => (
                    <ListItemButton
                        key={`FileSelector-${tag.catalog_name}`}
                        dense
                        selected={currentCatalog === tag.catalog_name}
                        onClick={() => setCurrentCatalog(tag.catalog_name)}
                    >
                        <ListItemText
                            primary={tag.catalog_name}
                            secondary={tag.spec_type}
                        />
                    </ListItemButton>
                ))
            ) : (
                <FormattedMessage id="common.loading" />
            )}
        </List>
    );
}

export default EditorFileSelector;
