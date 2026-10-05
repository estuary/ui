import type { Entity } from 'src/types';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';

import { RefreshDouble } from 'iconoir-react';

import useDiscoverCapture from 'src/components/capture/useDiscoverCapture';
import { disabledButtonText } from 'src/context/Theme';

interface Props {
    entityType: Entity;
}

function RediscoverButton({ entityType }: Props) {
    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        { initiateRediscovery: true }
    );

    const theme = useTheme();
    const disable = isSaving || formActive;

    return (
        <Tooltip
            placement="top"
            title="Refresh collections with latest from source"
        >
            <Box>
                <IconButton
                    disabled={disable}
                    onClick={() => void generateCatalog()}
                    sx={{ borderRadius: 0 }}
                    aria-label="Refresh"
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
