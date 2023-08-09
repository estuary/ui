import { IconButton, Tooltip, useTheme } from '@mui/material';
import useDiscoverCapture from 'components/capture/useDiscoverCapture';
import { disabledButtonText } from 'context/Theme';
import { RefreshDouble } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
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
    const theme = useTheme();
    const { generateCatalog, isSaving, formActive } = useDiscoverCapture(
        entityType,
        callFailed,
        postGenerateMutate,
        { initiateRediscovery: true }
    );

    return (
        <Tooltip
            title={
                <FormattedMessage id="workflows.collectionSelector.cta.rediscover" />
            }
        >
            <IconButton
                disabled={disabled || isSaving || formActive}
                onClick={generateCatalog}
                sx={{ borderRadius: 0 }}
            >
                <RefreshDouble
                    style={{
                        color: disabled
                            ? disabledButtonText[theme.palette.mode]
                            : theme.palette.primary.main,
                    }}
                />
            </IconButton>
        </Tooltip>
    );
}

export default RediscoverButton;
