import { Checkbox, IconButton, Stack, TextField } from '@mui/material';
import { Cancel } from 'iconoir-react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    itemType: string;
}

function CollectionSelectorHeader({ itemType }: Props) {
    // Might be good to remove. Only needed if we need to mess with the value of the input
    const searchTextField = useRef<HTMLInputElement>(null);

    const intl = useIntl();

    return (
        <Stack direction="row">
            <Checkbox />
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
                }}
                sx={{
                    'width': 'auto',
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
            <IconButton
                size="small"
                sx={{ color: (theme) => theme.palette.text.primary }}
            >
                <Cancel />
            </IconButton>
        </Stack>
    );
}

export default CollectionSelectorHeader;
