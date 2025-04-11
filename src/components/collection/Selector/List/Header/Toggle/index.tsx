import type { CollectionSelectorHeaderToggleProps } from 'src/components/collection/Selector/List/Header/Toggle/types';

import { useEffect, useState } from 'react';

import { Box, Button, Switch, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import { dataGridEntireCellButtonStyling } from 'src/context/Theme';
import { useBinding_someBindingsDisabled } from 'src/stores/Binding/hooks';

function CollectionSelectorHeaderToggle({
    disabled,
    itemType,
    onClick,
}: CollectionSelectorHeaderToggleProps) {
    const intl = useIntl();

    const someBindingsDisabled = useBinding_someBindingsDisabled();

    const [enabled, setEnabled] = useState(someBindingsDisabled);

    const tooltipTitle = intl.formatMessage(
        {
            id: enabled
                ? 'workflows.collectionSelector.toggle.enable.tooltip'
                : 'workflows.collectionSelector.toggle.disable.tooltip',
        },
        { itemType }
    );

    useEffect(() => {
        setEnabled(someBindingsDisabled);
    }, [setEnabled, someBindingsDisabled]);

    return (
        <Box
            sx={{
                ...dataGridEntireCellButtonStyling,
            }}
        >
            <Tooltip title={tooltipTitle}>
                <Button
                    aria-label={tooltipTitle}
                    disabled={disabled}
                    sx={dataGridEntireCellButtonStyling}
                    variant="text"
                    onClick={(event) => {
                        setEnabled(!enabled);
                        onClick(event, !enabled, 'all');
                    }}
                >
                    <Switch
                        disabled={disabled}
                        size="small"
                        checked={!enabled}
                        color="success"
                        id="binding-toggle__all_bindings"
                    />
                </Button>
            </Tooltip>
        </Box>
    );
}

export default CollectionSelectorHeaderToggle;

// <Button
//     disabled={disabled}
//     endIcon={<KeyboardArrowDown />}
//     size="small"
//     variant="text"
//     sx={{
//         ...dataGridEntireCellButtonStyling,
//         py: 0,
//         px: 0.5,
//         textTransform: 'none',
//     }}
//     onClick={(event) => {
//         event.stopPropagation();
//         setAnchorEl(event.currentTarget);
//     }}
// >
//     {intl.formatMessage({
//         id: buttonTitle,
//     })}
// </Button>
