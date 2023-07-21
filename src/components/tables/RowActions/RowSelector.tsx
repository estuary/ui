import { useState } from 'react';

import { MinusSquare, NavArrowDown, Square } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { Button, ButtonGroup, Menu, MenuItem, Stack } from '@mui/material';

import DeleteButton from 'components/tables/RowActions/Delete/Button';
import DisableEnableButton from 'components/tables/RowActions/DisableEnable/Button';
import Materialize from 'components/tables/RowActions/Materialize';

import { useZustandStore } from 'context/Zustand/provider';

import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

import { RowSelectorProps } from './types';

function RowSelector({
    hideActions,
    selectableTableStoreName = SelectTableStoreNames.CAPTURE,
    showMaterialize,
}: RowSelectorProps) {
    const intl = useIntl();

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

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        openMenu: (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        toggleSelection: () => {
            setAll(!hasSelections);
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
                    {hasSelections ? <MinusSquare /> : <Square />}
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

            {hideActions ? null : (
                <ButtonGroup
                    aria-label={intl.formatMessage({
                        id: 'capturesTable.ctaGroup.aria',
                    })}
                    disableElevation
                    disabled={!hasSelections}
                >
                    <DisableEnableButton
                        selectableTableStoreName={selectableTableStoreName}
                        enabling={true}
                    />

                    <DisableEnableButton
                        selectableTableStoreName={selectableTableStoreName}
                        enabling={false}
                    />

                    <DeleteButton
                        selectableTableStoreName={selectableTableStoreName}
                    />
                </ButtonGroup>
            )}

            {showMaterialize ? (
                <Materialize
                    selectableTableStoreName={selectableTableStoreName}
                />
            ) : null}

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
                <MenuItem onClick={() => setAll(true)}>All</MenuItem>

                <MenuItem onClick={() => setAll(false)}>None</MenuItem>
            </Menu>
        </Stack>
    );
}

export default RowSelector;
