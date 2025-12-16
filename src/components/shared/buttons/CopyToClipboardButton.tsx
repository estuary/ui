import type { CopyToClipboardButtonProps } from 'src/components/shared/buttons/types';

import { Button, IconButton, useTheme } from '@mui/material';

import { getButtonIcon } from 'src/context/Theme';
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';

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

    const { isCopied, handleCopy } = useCopyToClipboard(
        'CopyToClipboardButton'
    );
    const icon = getButtonIcon(theme, isCopied ? 'success' : undefined);

    if (!children) {
        return (
            <IconButton
                size="small"
                color={isCopied ? 'success' : undefined}
                onClick={() => handleCopy(writeValue)}
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
            color={isCopied ? 'success' : undefined}
            onClick={() => handleCopy(writeValue)}
        >
            {children}
        </Button>
    );
}

export default CopyToClipboardButton;
