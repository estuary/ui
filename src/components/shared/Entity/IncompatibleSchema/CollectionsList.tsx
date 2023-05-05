import { Chip, ListItem, Stack } from '@mui/material';
import { useBindingsEditorStore_invalidSchemaCollections } from 'components/editor/Bindings/Store/hooks';

function CollectionsList() {
    const collections = useBindingsEditorStore_invalidSchemaCollections();

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
            {collections.map((collectionName: string) => {
                return (
                    <ListItem
                        key={`evolving-collections-${collectionName}`}
                        dense
                        sx={{ px: 0.5, width: 'auto' }}
                    >
                        <Chip label={collectionName} />
                    </ListItem>
                );
            })}
        </Stack>
    );
}

export default CollectionsList;
