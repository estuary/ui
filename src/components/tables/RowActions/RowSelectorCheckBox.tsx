import { Badge, Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { useZustandStore } from 'context/Zustand/provider';
import { MinusSquare, NavArrowDown, Square } from 'iconoir-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { MAX_BINDINGS } from 'utils/workflow-utils';
import { RowSelectorProps } from './types';

type Props = Pick<
    RowSelectorProps,
    'selectKeyValueName' | 'selectableTableStoreName' | 'showSelectedCount'
>;

function RowSelectorCheckBox({
    selectKeyValueName,
    selectableTableStoreName = SelectTableStoreNames.CAPTURE,
    showSelectedCount,
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
            <Badge
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                badgeContent={selectedRows.size}
                max={MAX_BINDINGS}
                invisible={!showSelectedCount}
            >
                <Button size="small" variant="text" onClick={toggleSelection}>
                    {hasSelections ? <MinusSquare /> : <Square />}
                </Button>
            </Badge>

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
                <MenuItem onClick={() => setAll(true, selectKeyValueName)}>
                    <FormattedMessage id="entityTable.rowSelector.all" />
                </MenuItem>

                <MenuItem onClick={() => setAll(false, selectKeyValueName)}>
                    <FormattedMessage id="entityTable.rowSelector.none" />
                </MenuItem>
            </Menu>
        </ButtonGroup>
    );
}

export default RowSelectorCheckBox;
