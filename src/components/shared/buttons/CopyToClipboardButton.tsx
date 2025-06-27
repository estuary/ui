import type { CopyToClipboardButtonProps } from 'src/components/shared/buttons/types';
import type { TransientButtonState } from 'src/context/Theme';

import { useState } from 'react';

import { Button, IconButton, useTheme } from '@mui/material';

import { getButtonIcon } from 'src/context/Theme';

function CopyToClipboardButton({
    children,
    writeValue,
}: CopyToClipboardButtonProps) {
    const theme = useTheme();

    const [transientButtonState, setTransientButtonState] =
        useState<TransientButtonState>(undefined);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(writeValue).then(
            () => {
                setTransientButtonState('success');

                setTimeout(() => setTransientButtonState(undefined), 2000);
            },
            () => {
                setTransientButtonState('error');

                setTimeout(() => setTransientButtonState(undefined), 2000);
            }
        );
    };

    const icon = getButtonIcon(theme, transientButtonState);

    if (!children) {
        return (
            <IconButton
                size="small"
                color={transientButtonState}
                onClick={copyToClipboard}
            >
                {icon}
            </IconButton>
        );
    }

    return (
        <Button
            variant="text"
            size="small"
            endIcon={icon}
            color={transientButtonState}
            onClick={copyToClipboard}
        >
            {children}
        </Button>
    );
}

export default CopyToClipboardButton;
