import { List, ListItemButton, ListItemText } from '@mui/material';
import { useZustandStore } from 'components/editor/Store';
import { FormattedMessage } from 'react-intl';

function EditorFileSelector() {
    const {
        currentCatalog,
        setCurrentCatalog,
        id,
        specs: draftSpecs,
    } = useZustandStore();

    return (
        <List dense disablePadding>
            {!id ? null : draftSpecs && draftSpecs.length > 0 ? (
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
