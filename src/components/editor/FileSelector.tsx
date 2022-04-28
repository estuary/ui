import { List, ListItemButton, ListItemText } from '@mui/material';
import { LiveSpecQuery } from 'components/capture/details';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';

function EditorFileSelector() {
    const currentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>,
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    const setCurrentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>,
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>['setCurrentCatalog']
    >((state) => state.setCurrentCatalog);

    const id = useZustandStore<
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>,
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>['id']
    >((state) => state.id);

    const specs = useZustandStore<
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>,
        EditorStoreState<LiveSpecQuery | DraftSpecQuery>['specs']
    >((state) => state.specs);

    return (
        <List dense disablePadding>
            {!id ? null : specs && specs.length > 0 ? (
                specs.map((tag: any, index: number) => (
                    <ListItemButton
                        key={`FileSelector-${tag.catalog_name}`}
                        dense
                        selected={index === currentCatalog}
                        onClick={() => setCurrentCatalog(index)}
                        sx={{
                            borderBottom: 1,
                        }}
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
