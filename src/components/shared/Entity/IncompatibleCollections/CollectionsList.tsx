import { Chip, ListItem, Stack } from '@mui/material';
import { useBindingsEditorStore_incompatibleCollections } from 'components/editor/Bindings/Store/hooks';

function CollectionsList() {
    const incompatibleCollections =
        useBindingsEditorStore_incompatibleCollections();

    return (
        <Stack
            direction="row"
            component="ul"
            sx={{
                maxHeight: 125,
                flexFlow: 'wrap',
                overflowY: 'auto',
                pl: 0,
                ml: 1,
            }}
        >
            {incompatibleCollections.map((incompatibleCollection) => {
                return (
                    <ListItem
                        key={`evolving-collections-${incompatibleCollection.collection}`}
                        dense
                        sx={{ px: 0.5, width: 'auto' }}
                    >
                        <Chip label={incompatibleCollection.collection} />
                    </ListItem>
                );
            })}
        </Stack>
    );
}

export default CollectionsList;
