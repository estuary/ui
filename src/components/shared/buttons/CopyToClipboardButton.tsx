import type { CopyToClipboardButtonProps } from 'src/components/shared/buttons/types';
import type { TransientButtonState } from 'src/context/Theme';

import { useState } from 'react';

import { Button, IconButton, useTheme } from '@mui/material';

import { getButtonIcon } from 'src/context/Theme';

// TODO (maybe) this might make less sense as a component
//  and way more as a headless hook. So if you have to add more
//  support for customizing the button make sure it isn't better
//  to not share the button stuff and put the main fuctionality
//  into a hook.
function CopyToClipboardButton({
    children,
    writeValue,
}: CopyToClipboardButtonProps) {
    const theme = useTheme();

    const [transientButtonState, setTransientButtonState] =
        useState<TransientButtonState>(undefined);

    const copyToClipboard = () => {
        if (writeValue) {
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
        }
    };

    const icon = getButtonIcon(theme, transientButtonState);

    if (!children) {
        return (
            <IconButton
                size="small"
                color={transientButtonState}
                onClick={copyToClipboard}
                disabled={!writeValue}
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
