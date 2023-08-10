import { Box, Checkbox, IconButton, Stack, TextField } from '@mui/material';
import { Cancel } from 'iconoir-react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    itemType: string;
    onFilterChange: (value: string) => void;
}

function CollectionSelectorHeader({ itemType, onFilterChange }: Props) {
    // Might be good to remove. Only needed if we need to mess with the value of the input
    const searchTextField = useRef<HTMLInputElement>(null);

    const intl = useIntl();

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <Box>
                <Checkbox />
            </Box>
            <TextField
                inputRef={searchTextField}
                id="capture-search-box"
                label={intl.formatMessage(
                    {
                        id: 'entityCreate.bindingsConfig.list.search',
                    },
                    {
                        itemType,
                    }
                )}
                variant="outlined"
                size="small"
                onChange={(event) => {
                    console.log('filter', event.target.value);
                    onFilterChange(event.target.value);
                }}
                sx={{
                    'flexGrow': 1,
                    'my': 2,
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
            <Box>
                <IconButton
                    size="small"
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    <Cancel />
                </IconButton>
            </Box>
        </Stack>
    );
}

export default CollectionSelectorHeader;
