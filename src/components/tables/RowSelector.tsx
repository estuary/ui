import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { SelectableTableStore } from 'components/tables/Store';
import { useZustandStore } from 'hooks/useZustand';
import { useState } from 'react';

function RowSelector() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >((state) => state.selected);

    console.log('Selected Rows', selectedRows);

    return (
        <Stack direction="row">
            <Button>
                {selectedRows.size > 0 ? (
                    <IndeterminateCheckBoxIcon />
                ) : (
                    <CheckBoxOutlineBlankIcon />
                )}
            </Button>
            <IconButton
                id="row-selector-button"
                aria-haspopup="true"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <ArrowDropDownIcon />
            </IconButton>
            <Menu
                id="row-selector-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <MenuItem>All</MenuItem>
                <MenuItem>None</MenuItem>
            </Menu>
        </Stack>
    );
}

export default RowSelector;
