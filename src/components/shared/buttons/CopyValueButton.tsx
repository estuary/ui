import type { ButtonProps } from '@mui/material';

import { Button } from '@mui/material';

import { CheckCircle, Copy } from 'iconoir-react';

import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';

interface CopyValueButtonProps extends Omit<ButtonProps, 'onClick'> {
    value: string;
    /** Names the caller in telemetry when the clipboard write fails. */
    source: string;
    label: string;
    copiedLabel?: string;
    /** Called once the value has actually reached the clipboard. */
    onCopied?: () => void;
}

/**
 * A prominent copy action: the whole button is the affordance, and it confirms
 * in place once the value is on the clipboard.
 *
 * Suits a value the page exists to hand over — an access token, a freshly
 * minted API key — where copying is the primary thing to do and the value
 * itself does not need to be on screen. For a copy affordance beside content
 * the user is reading, see `CopyToClipboardButton`.
 */
export function CopyValueButton({
    value,
    source,
    label,
    copiedLabel = 'Copied',
    onCopied,
    ...props
}: CopyValueButtonProps) {
    const { isCopied, handleCopy } = useCopyToClipboard(source);

    return (
        <Button
            variant="contained"
            startIcon={
                isCopied ? (
                    <CheckCircle width={20} height={20} />
                ) : (
                    <Copy width={20} height={20} />
                )
            }
            color={isCopied ? 'success' : 'primary'}
            onClick={() => {
                void handleCopy(value)?.then((copied) => {
                    if (copied) {
                        onCopied?.();
                    }
                });
            }}
            {...props}
        >
            {isCopied ? copiedLabel : label}
        </Button>
    );
}
