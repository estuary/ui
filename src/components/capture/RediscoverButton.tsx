import type { Entity } from 'src/types';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';

import { RefreshDouble } from 'iconoir-react';
import { useIntl } from 'react-intl';

import useDiscoverCapture from 'src/components/capture/useDiscoverCapture';
import { disabledButtonText } from 'src/context/Theme';

interface Props {
    entityType: Entity;
    disabled: boolean;
}

function RediscoverButton({ entityType, disabled }: Props) {
    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        { initiateRediscovery: true }
    );

    const intl = useIntl();
    const theme = useTheme();

    const disable = disabled || isSaving || formActive;

    return (
        <Tooltip
            placement="top"
            title={intl.formatMessage({
                id: 'workflows.collectionSelector.cta.rediscover.tooltip',
            })}
        >
            <Box>
                <IconButton
                    disabled={disable}
                    onClick={() => void generateCatalog()}
                    sx={{ borderRadius: 0 }}
                    aria-label={intl.formatMessage({
                        id: 'workflows.collectionSelector.cta.rediscover',
                    })}
                >
                    <RefreshDouble
                        style={{
                            color: disable
                                ? disabledButtonText[theme.palette.mode]
                                : theme.palette.primary.main,
                        }}
                    />
                </IconButton>
            </Box>
        </Tooltip>
    );
}

export default RediscoverButton;
