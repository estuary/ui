import { KeyboardArrowDown } from '@mui/icons-material';
import { Box, Button, Menu, MenuItem, Stack, Tooltip } from '@mui/material';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

type Scopes = 'page' | 'all';

interface Props {
    itemType: string;

    onClick: (event: any, value: boolean) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderToggle({
    disabled,
    itemType,
    onClick,
}: Props) {
    const intl = useIntl();
    const [enabled, setEnabled] = useState(false);
    const [scope, setScope] = useState<Scopes>('page');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const showMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
    };

    const tooltipTitle = useMemo(() => {
        if (scope === 'page') {
            return enabled
                ? 'workflows.collectionSelector.toggle.enable.tooltip'
                : 'workflows.collectionSelector.toggle.disable.tooltip';
        }

        return enabled
            ? 'workflows.collectionSelector.toggle.enable.all.tooltip'
            : 'workflows.collectionSelector.toggle.disable.all.tooltip';
    }, [enabled, scope]);

    const buttonTitle = useMemo(() => {
        if (scope === 'page') {
            return enabled
                ? 'workflows.collectionSelector.toggle.enable'
                : 'workflows.collectionSelector.toggle.disable';
        }

        return enabled
            ? 'workflows.collectionSelector.toggle.enable.all'
            : 'workflows.collectionSelector.toggle.disable.all';
    }, [enabled, scope]);

    const menuOptions = useMemo(() => {
        if (enabled) {
            return [
                'workflows.collectionSelector.toggle.enable.all',
                'workflows.collectionSelector.toggle.enable',
            ];
        }

        return [
            'workflows.collectionSelector.toggle.disable.all',
            'workflows.collectionSelector.toggle.disable',
        ];
    }, [enabled]);

    return (
        <Tooltip
            title={intl.formatMessage(
                {
                    id: tooltipTitle,
                },
                { itemType }
            )}
        >
            <Box
                sx={{
                    ...dataGridEntireCellButtonStyling,
                }}
            >
                <Stack direction="row">
                    <Button
                        disabled={disabled}
                        size="small"
                        variant="text"
                        sx={{
                            ...dataGridEntireCellButtonStyling,
                            py: 0,
                            px: 1,
                            textTransform: 'none',
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            setEnabled(!enabled);
                            onClick(event, !enabled);
                        }}
                    >
                        {intl.formatMessage({
                            id: buttonTitle,
                        })}
                    </Button>
                    <Button
                        size="small"
                        variant="text"
                        sx={{
                            ...dataGridEntireCellButtonStyling,
                            py: 0,
                            px: 1,
                            textTransform: 'none',
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            setAnchorEl(event.currentTarget);
                        }}
                    >
                        <KeyboardArrowDown />
                    </Button>
                    <Menu
                        open={showMenu}
                        anchorEl={anchorEl}
                        onClose={closeMenu}
                    >
                        <MenuItem
                            onClick={() => {
                                setScope('all');
                                closeMenu();
                            }}
                        >
                            <FormattedMessage id={menuOptions[0]} />
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                setScope('page');
                                closeMenu();
                            }}
                        >
                            <FormattedMessage id={menuOptions[1]} />
                        </MenuItem>
                    </Menu>
                </Stack>
            </Box>
        </Tooltip>
    );
}

export default CollectionSelectorHeaderToggle;
