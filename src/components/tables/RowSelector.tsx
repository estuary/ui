import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useZustandStore } from 'hooks/useZustand';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

function RowSelector() {
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreSelectors.selected.get);

    const setAll = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreSelectors.selected.setAll);

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
        <>
            <ButtonGroup>
                <Button
                    size="small"
                    variant="text"
                    onClick={handlers.toggleSelection}
                >
                    {hasSelections ? (
                        <IndeterminateCheckBoxIcon />
                    ) : (
                        <CheckBoxOutlineBlankIcon />
                    )}
                </Button>
                <Button
                    id="row-selector-button"
                    size="small"
                    variant="text"
                    aria-haspopup="true"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handlers.openMenu}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>

            <ButtonGroup
                variant="contained"
                aria-label={intl.formatMessage({
                    id: 'capturesTable.ctaGroup.aria',
                })}
                disabled={!hasSelections}
            >
                <Button>
                    <FormattedMessage id="cta.enable" />
                </Button>
                <Button>
                    <FormattedMessage id="cta.disable" />
                </Button>
            </ButtonGroup>

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
        </>
    );
}

export default RowSelector;
