import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { Button, ButtonGroup, Menu, MenuItem, Stack } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useZustandStore } from 'hooks/useZustand';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { getPathWithParam } from 'utils/misc-utils';

export interface RowSelectorProps {
    showMaterialize?: boolean;
}

function RowSelector({ showMaterialize }: RowSelectorProps) {
    const navigate = useNavigate();
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
        delete: () => {},
        toggle: (enable: boolean) => {
            throw Error(
                `Toggling enable/disable not implemented yet. Passing variable ${enable}`
            );
        },
        materialize: () => {
            const selectedRowsArray: string[] = [];

            selectedRows.forEach((value, key) => {
                selectedRowsArray.push(key);
            });

            if (selectedRowsArray.length > 0) {
                navigate(
                    getPathWithParam(
                        routeDetails.materializations.create.fullPath,
                        routeDetails.materializations.create.params.specID,
                        selectedRowsArray
                    )
                );
            }
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
                disableElevation
                disabled={!hasSelections}
            >
                <Button onClick={() => handlers.toggle(true)}>
                    <FormattedMessage id="cta.enable" />
                </Button>
                <Button onClick={() => handlers.toggle(false)}>
                    <FormattedMessage id="cta.disable" />
                </Button>
                <Button onClick={() => handlers.delete()}>
                    <FormattedMessage id="cta.delete" />
                </Button>
            </ButtonGroup>

            {showMaterialize ? (
                <Button
                    disabled={!hasSelections}
                    onClick={handlers.materialize}
                >
                    <FormattedMessage id="cta.materialize" />
                </Button>
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
