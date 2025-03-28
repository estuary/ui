import type { ReactNode} from 'react';
import { useState } from 'react';

import { Button, ButtonGroup, Menu, MenuItem, Stack } from '@mui/material';

import { MinusSquare, NavArrowDown, Square } from 'iconoir-react';

import { EVERYTHING } from 'src/components/collection/Selector/Table/shared';
import { useZustandStore } from 'src/context/Zustand/provider';
import type { SelectTableStoreNames } from 'src/stores/names';
import type {
    SelectableTableStore} from 'src/stores/Tables/Store';
import {
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import DeleteButton from 'src/components/tables/RowActions/AccessGrants/DeleteButton';

interface Props {
    additionalCTA: ReactNode;
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
}

function RowSelector({ additionalCTA, selectTableStoreName }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.get);

    const setAll = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const selectionsExist = selectedRows.size > 0;

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        toggleSelection: () => {
            setAll(!selectionsExist, EVERYTHING);
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

            <DeleteButton selectTableStoreName={selectTableStoreName} />

            {additionalCTA}

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
