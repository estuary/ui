import { Chip, ListItem, Stack } from '@mui/material';
import { useBindingsEditorStore_invalidSchemaCollections } from 'components/editor/Bindings/Store/hooks';

function CollectionsList() {
    const collections = useBindingsEditorStore_invalidSchemaCollections();

    console.log('CollectionsList', collections);

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
            {collections.map((data) => {
                return (
                    <ListItem
                        key={`evolving-collections-${data.collection}`}
                        dense
                        sx={{ px: 0.5, width: 'auto' }}
                    >
                        <Chip label={data.collection} />
                    </ListItem>
                );
            })}
        </Stack>
    );
}

export default CollectionsList;
