import { Chip, ListItem, Stack } from '@mui/material';

interface Props {
    items: string[];
    keyPrefix: string;
    maxHeight?: number;
}

// Styled different from the table because this is based on
//  when chips are shown inside an autocomplete. We'll need
//  to decide if we want to keep two styled of chips. One
//  for the table and one for elsewhere.
function ChipList({ items, keyPrefix, maxHeight }: Props) {
    return (
        <Stack
            direction="row"
            component="ul"
            sx={{
                maxHeight: maxHeight ?? 125,
                flexFlow: 'wrap',
                overflowY: 'auto',
                pl: 0,
                ml: 1,
            }}
        >
            {items.map((item) => {
                return (
                    <ListItem
                        key={`${keyPrefix}${item}`}
                        dense
                        sx={{ px: 0.5, width: 'auto' }}
                    >
                        <Chip label={item} />
                    </ListItem>
                );
            })}
        </Stack>
    );
}

export default ChipList;
