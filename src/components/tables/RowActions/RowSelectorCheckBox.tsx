import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { useZustandStore } from 'context/Zustand/provider';
import { MinusSquare, NavArrowDown, Square } from 'iconoir-react';
import { useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { RowSelectorProps } from './types';

type Props = Pick<
    RowSelectorProps,
    'selectKeyValueName' | 'selectableTableStoreName'
>;

function RowSelectorCheckBox({
    selectKeyValueName,
    selectableTableStoreName = SelectTableStoreNames.CAPTURE,
}: Props) {
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

    const hasSelections = selectedRows.size > 0;

    const closeMenu = () => {
        setAnchorEl(null);
    };
    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const toggleSelection = () => {
        setAll(!hasSelections, selectKeyValueName);
    };

    return (
        <ButtonGroup>
            <Button size="small" variant="text" onClick={toggleSelection}>
                {hasSelections ? <MinusSquare /> : <Square />}
            </Button>

            <Button
                id="row-selector-button"
                size="small"
                aria-haspopup="true"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                variant="text"
                onClick={openMenu}
            >
                <NavArrowDown />
            </Button>

            <Menu
                id="row-selector-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={closeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={() => setAll(true)}>All</MenuItem>

                <MenuItem onClick={() => setAll(false)}>None</MenuItem>
            </Menu>
        </ButtonGroup>
    );
}

export default RowSelectorCheckBox;
