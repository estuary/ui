import type { CollectionSelectorHeaderToggleProps } from 'src/components/collection/Selector/List/Header/Toggle/types';

import { useEffect, useState } from 'react';

import { Box, Button, Switch, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import { dataGridEntireCellButtonStyling } from 'src/context/Theme';

function CollectionSelectorHeaderToggle({
    disabled,
    itemType,
    onClick,
    defaultValue,
}: CollectionSelectorHeaderToggleProps) {
    const intl = useIntl();

    const [enabled, setEnabled] = useState(defaultValue);

    const tooltipTitle = intl.formatMessage(
        {
            id: enabled
                ? 'workflows.collectionSelector.toggle.enable.tooltip'
                : 'workflows.collectionSelector.toggle.disable.tooltip',
        },
        { itemType }
    );

    useEffect(() => {
        setEnabled(defaultValue);
    }, [setEnabled, defaultValue]);

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
