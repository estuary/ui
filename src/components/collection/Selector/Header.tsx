import { Checkbox, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { Cancel } from 'iconoir-react';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    itemType: string;
    onFilterChange: (value: string) => void;
}

function CollectionSelectorHeader({ itemType, onFilterChange }: Props) {
    const intl = useIntl();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdate = useCallback(
        debounce((value: string) => {
            onFilterChange(value);
        }, 750),
        [onFilterChange]
    );

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <Tooltip title="Enable/Disable All Bindings">
                <Checkbox />
            </Tooltip>
            <TextField
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
                    debouncedUpdate(event.target.value);
                }}
                sx={{
                    'flexGrow': 1,
                    'my': 1,
                    'mx': 2,
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
            <Tooltip title="Remove All Bindings">
                <IconButton
                    size="small"
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    <Cancel />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

export default CollectionSelectorHeader;
