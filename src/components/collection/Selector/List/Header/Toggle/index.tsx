import type { SyntheticEvent } from 'react';
import type { Scopes } from './types';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Box, Button, Menu, Tooltip } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useBinding_someBindingsDisabled } from 'stores/Binding/hooks';
import ScopeMenuContent from './MenuContent';

interface Props {
    itemType: string;
    onClick: (event: SyntheticEvent, value: boolean, scope: Scopes) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderToggle({
    disabled,
    itemType,
    onClick,
}: Props) {
    const entityType = useEntityType();

    const intl = useIntl();

    const someBindingsDisabled = useBinding_someBindingsDisabled();

    const [enabled, setEnabled] = useState(someBindingsDisabled);
    const [scope, setScope] = useState<Scopes>('page');

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const showMenu = Boolean(anchorEl);
    const closeMenu = () => {
        setAnchorEl(null);
    };

    const selectScope = (event: SyntheticEvent, newScope: Scopes) => {
        setScope(newScope);
        setEnabled(!enabled);
        onClick(event, !enabled, newScope);

        closeMenu();
    };

    useEffect(() => {
        setEnabled(someBindingsDisabled);
    }, [setEnabled, someBindingsDisabled]);

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

    const buttonTitle = useMemo(
        () => (enabled ? 'cta.enable' : 'cta.disable'),
        [enabled]
    );

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
                    endIcon={<KeyboardArrowDown />}
                    size="small"
                    variant="text"
                    sx={{
                        ...dataGridEntireCellButtonStyling,
                        py: 0,
                        px: 0.5,
                        textTransform: 'none',
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setAnchorEl(event.currentTarget);
                    }}
                >
                    {intl.formatMessage({
                        id: buttonTitle,
                    })}
                </Button>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                onClose={closeMenu}
                open={showMenu}
                sx={{ '& .MuiMenu-paper': { px: 2, borderRadius: 3 } }}
            >
                <ScopeMenuContent
                    closeMenu={closeMenu}
                    initialScope={scope}
                    itemType={itemType}
                    menuOptions={menuOptions}
                    updateScope={selectScope}
                />
            </Menu>
        </Box>
    );
}

export default CollectionSelectorHeaderToggle;
