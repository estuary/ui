import { KeyboardArrowDown } from '@mui/icons-material';
import { Box, Button, Menu, Stack, Tooltip } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import HeaderToggleMenuItem from './MenuItem';
import { Scopes } from './types';

interface Props {
    itemType: string;
    onClick: (event: any, value: boolean, scope: Scopes) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderToggle({
    disabled,
    itemType,
    onClick,
}: Props) {
    const entityType = useEntityType();

    const intl = useIntl();
    const [enabled, setEnabled] = useState(false);
    const [scope, setScope] = useState<Scopes>('page');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const showMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
    };

    const selectScope = (newScope: Scopes) => {
        setScope(newScope);
        closeMenu();
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
                {
                    title: 'workflows.collectionSelector.toggle.enable.all',
                    desc: 'workflows.collectionSelector.toggle.enable.all.tooltip',
                },
                {
                    title: 'workflows.collectionSelector.toggle.enable',
                    desc: 'workflows.collectionSelector.toggle.enable.tooltip',
                },
            ];
        }

        return [
            {
                title: 'workflows.collectionSelector.toggle.disable.all',
                desc: 'workflows.collectionSelector.toggle.disable.all.tooltip',
            },
            {
                title: 'workflows.collectionSelector.toggle.disable',
                desc: 'workflows.collectionSelector.toggle.disable.tooltip',
            },
        ];
    }, [enabled]);

    return (
        <Box
            sx={{
                ...dataGridEntireCellButtonStyling,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    ...dataGridEntireCellButtonStyling,
                    py: 0,
                }}
            >
                <Tooltip
                    title={intl.formatMessage(
                        {
                            id: tooltipTitle,
                        },
                        { itemType, entityType }
                    )}
                >
                    <Button
                        disabled={disabled}
                        size="small"
                        variant="text"
                        sx={{
                            py: 0,
                            px: 0.5,
                            textTransform: 'none',
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            setEnabled(!enabled);
                            onClick(event, !enabled, scope);
                        }}
                    >
                        {intl.formatMessage({
                            id: buttonTitle,
                        })}
                    </Button>
                </Tooltip>
                <Button
                    disabled={disabled}
                    size="small"
                    variant="text"
                    sx={{
                        p: 0,
                        minWidth: 20,
                        maxWidth: 20,
                        textTransform: 'none',
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setAnchorEl(event.currentTarget);
                    }}
                >
                    <KeyboardArrowDown />
                </Button>
                <Menu open={showMenu} anchorEl={anchorEl} onClose={closeMenu}>
                    <HeaderToggleMenuItem
                        desc={
                            <FormattedMessage
                                id={menuOptions[0].desc}
                                values={{ itemType, entityType }}
                            />
                        }
                        onClick={() => selectScope('all')}
                        scope="all"
                        scopeState={scope}
                        title={<FormattedMessage id={menuOptions[0].title} />}
                    />
                    <HeaderToggleMenuItem
                        desc={
                            <FormattedMessage
                                id={menuOptions[1].desc}
                                values={{ itemType, entityType }}
                            />
                        }
                        onClick={() => selectScope('page')}
                        scope="page"
                        scopeState={scope}
                        title={<FormattedMessage id={menuOptions[1].title} />}
                    />
                </Menu>
            </Stack>
        </Box>
    );
}

export default CollectionSelectorHeaderToggle;
