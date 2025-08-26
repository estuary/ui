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
            <Tooltip title={tooltipTitle} placement="top">
                <Button
                    aria-label={tooltipTitle}
                    disabled={disabled}
                    sx={dataGridEntireCellButtonStyling}
                    variant="text"
                    onClick={async (event) => {
                        // Save off the previous value so we can reset it
                        const previousValue = enabled;

                        // Set the value right away so the toggles feels fast
                        setEnabled(!enabled);

                        onClick(event, !enabled, 'all').catch(() => {
                            // If there was an error switch it back
                            setEnabled(previousValue);
                        });
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
