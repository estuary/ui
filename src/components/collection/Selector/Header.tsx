import {
    Box,
    Checkbox,
    FormControl,
    IconButton,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';
import { Cancel } from 'iconoir-react';
import { useIntl } from 'react-intl';

interface Props {
    itemType: string;
    onFilterChange: (value: string) => void;
    disabled?: boolean;
    onRemoveAllClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onToggleAllClick?: (event: React.ChangeEvent<HTMLElement>) => void;
}

function CollectionSelectorHeader({
    disabled,
    itemType,
    onFilterChange,
    onRemoveAllClick,
    onToggleAllClick,
}: Props) {
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
            <Tooltip title="Enable/Disable All Bindings">
                <Box>
                    <FormControl>
                        <Checkbox
                            size="small"
                            disabled={disabled}
                            onChange={onToggleAllClick}
                        />
                    </FormControl>
                </Box>
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
                    onFilterChange(event.target.value);
                }}
                sx={{
                    'flexGrow': 1,
                    'my': 1,
                    '& .MuiInputBase-root': { borderRadius: 3, my: 0 },
                }}
            />
            {onRemoveAllClick ? (
                <Tooltip
                    title={intl.formatMessage(
                        {
                            id: 'entityCreate.bindingsConfig.list.removeAll',
                        },
                        {
                            itemType,
                        }
                    )}
                >
                    <Box>
                        <IconButton
                            disabled={disabled}
                            onClick={onRemoveAllClick}
                            size="small"
                            sx={{
                                color: (theme) => theme.palette.text.primary,
                                ml: 1,
                            }}
                        >
                            <Cancel />
                        </IconButton>
                    </Box>
                </Tooltip>
            ) : null}
        </Stack>
    );
}

export default CollectionSelectorHeader;
