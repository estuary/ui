import { Button, ButtonGroup, Menu, MenuItem, Stack } from '@mui/material';
import DisableButton from 'components/tables/RowActions/AccessLinks/DisableButton';
import { useZustandStore } from 'context/Zustand/provider';
import { MinusSquare, NavArrowDown, Square } from 'iconoir-react';
import { useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

function RowSelector() {
    // const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.get);

    const setAll = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const selectionsExist = selectedRows.size > 0;

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        toggleSelection: () => {
            setAll(!selectionsExist, 'token');
        },
    };

    return (
        <Stack direction="row" spacing={2}>
            <ButtonGroup>
                <Button
                    size="small"
                    variant="text"
                    onClick={handlers.toggleSelection}
                >
                    {selectionsExist ? <MinusSquare /> : <Square />}
                </Button>

                <Button
                    id="row-selector-button"
                    size="small"
                    aria-haspopup="true"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    variant="text"
                    onClick={handlers.openMenu}
                >
                    <NavArrowDown />
                </Button>
            </ButtonGroup>

            <DisableButton />

            <Menu
                id="row-selector-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.closeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={() => setAll(true, 'token')}>All</MenuItem>

                <MenuItem onClick={() => setAll(false)}>None</MenuItem>
            </Menu>
        </Stack>
    );
}

export default RowSelector;
