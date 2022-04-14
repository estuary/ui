import { List, ListItemButton, ListItemText } from '@mui/material';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';

function EditorFileSelector() {
    const setCurrentCatalog = useEditorStore(
        editorStoreSelectors.setCurrentCatalog
    );
    const currentCatalog = useEditorStore(editorStoreSelectors.currentCatalog);
    const draftId = useEditorStore(editorStoreSelectors.draftId);
    const { draftSpecs } = useDraftSpecs(draftId);

    return (
        <List dense disablePadding>
            {draftSpecs.length > 0 ? (
                draftSpecs.map((tag: any, index: number) => (
                    <ListItemButton
                        key={`FileSelector-${tag.catalog_name}`}
                        dense
                        selected={index === currentCatalog}
                        onClick={() => setCurrentCatalog(index)}
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
