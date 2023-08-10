import { Checkbox, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { Cancel } from 'iconoir-react';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    itemType: string;
    onFilterChange: (value: string) => void;
    disabled?: boolean;
    onRemoveAllClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

function CollectionSelectorHeader({
    disabled,
    itemType,
    onFilterChange,
    onRemoveAllClick,
}: Props) {
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
                <Checkbox disabled={disabled} />
            </Tooltip>
            <TextField
                disabled={disabled}
                label={intl.formatMessage(
                    {
                        id: 'entityCreate.bindingsConfig.list.search',
                    },
                    {
                        itemType,
                    }
                )}
                size="small"
                variant="outlined"
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
            {onRemoveAllClick ? (
                <Tooltip title="Remove All Bindings">
                    <IconButton
                        disabled={disabled}
                        onClick={onRemoveAllClick}
                        size="small"
                        sx={{ color: (theme) => theme.palette.text.primary }}
                    >
                        <Cancel />
                    </IconButton>
                </Tooltip>
            ) : null}
        </Stack>
    );
}

export default CollectionSelectorHeader;
