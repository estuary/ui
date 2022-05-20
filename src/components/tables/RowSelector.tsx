import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import {
    Alert,
    Button,
    ButtonGroup,
    List,
    ListItem,
    Menu,
    MenuItem,
    Stack,
} from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useZustandStore } from 'hooks/useZustand';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { getPathWithParam } from 'utils/misc-utils';

export interface RowSelectorProps {
    showMaterialize?: boolean;
}

interface DeleteConfirmationprops {
    deleting: any; //SelectableTableStore['selected'];
}

function DeleteConfirmation({ deleting }: DeleteConfirmationprops) {
    return (
        <>
            <Alert severity="warning">
                <FormattedMessage id="capturesTable.delete.confirm" />
            </Alert>
            <List>
                {deleting.map((value: any, index: number) => {
                    console.log({
                        value,
                    });

                    return <ListItem key={index}>{value}</ListItem>;
                })}
            </List>
        </>
    );
}

function RowSelector({ showMaterialize }: RowSelectorProps) {
    const confirmationModalContext = useConfirmationModalContext();

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

    const rows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['rows']
    >(selectableTableStoreSelectors.rows.get);

    const hasSelections = selectedRows.size > 0;

    const handlers = {
        closeMenu: () => {
            setAnchorEl(null);
        },
        delete: () => {
            if (hasSelections) {
                const deleting: string[] = [];

                selectedRows.forEach((value: any, key: string) => {
                    deleting.push(rows.get(key).catalog_name);
                });

                confirmationModalContext
                    ?.showConfirmation({
                        message: <DeleteConfirmation deleting={deleting} />,
                    })
                    .then((confirmed: any) => {
                        if (confirmed) {
                            console.log('Going to delete stuff now');
                        }
                    })
                    .catch(() => {});
            }
        },
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
