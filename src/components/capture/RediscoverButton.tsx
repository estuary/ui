import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import useDiscoverCapture from 'components/capture/useDiscoverCapture';
import { disabledButtonText } from 'context/Theme';
import { RefreshDouble } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { Entity } from 'types';

interface Props {
    entityType: Entity;
    disabled: boolean;
    callFailed: Function;
    postGenerateMutate: Function;
}

function RediscoverButton({
    entityType,
    disabled,
    callFailed,
    postGenerateMutate,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();
    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        callFailed,
        postGenerateMutate,
        { initiateRediscovery: true }
    );
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
                    onClick={generateCatalog}
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
