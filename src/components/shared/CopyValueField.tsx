import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import { useState } from 'react';

import { Stack, Typography } from '@mui/material';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { CopyIconIndicator } from 'src/components/shared/CopyIconIndicator';
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';

interface CopyValueFieldProps {
    label: string;
    value: string | null;
    /** Names the caller in telemetry when the clipboard write fails. */
    source: string;
    /** Renders the value as plain text with no copy affordance. */
    showCopyButton?: boolean;
    /** Called once the value has actually reached the clipboard. */
    onCopied?: () => void;
    /** Merged onto the monospace value text. */
    valueSx?: SystemStyleObject<Theme>;
}

/**
 * A labeled read-only value that copies itself: the whole field is the click
 * target, the copy icon fades in on hover, and a check confirms the copy in
 * place. Suits dense detail views where a button per value would be noise.
 * For a prominent standalone copy action, see `CopyValueButton`.
 */
export function CopyValueField({
    label,
    value,
    source,
    showCopyButton = true,
    onCopied,
    valueSx,
}: CopyValueFieldProps) {
    const { isCopied, handleCopy } = useCopyToClipboard(source);
    const [isHovered, setIsHovered] = useState(false);

    const copyValue = () => {
        void handleCopy(value)?.then((copied) => {
            if (copied) {
                onCopied?.();
            }
        });
    };

    return (
        <Stack
            onClick={showCopyButton ? copyValue : undefined}
            onMouseEnter={showCopyButton ? () => setIsHovered(true) : undefined}
            onMouseLeave={
                showCopyButton ? () => setIsHovered(false) : undefined
            }
            sx={{
                py: 1,
                cursor: showCopyButton && value ? 'pointer' : 'default',
            }}
        >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {label}
            </Typography>
            {showCopyButton ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <TechnicalEmphasis
                        sx={{
                            color: 'text.secondary',
                            fontSize: 12,
                            lineHeight: 1,
                            ...valueSx,
                        }}
                    >
                        {value}
                    </TechnicalEmphasis>
                    <CopyIconIndicator
                        isCopied={isCopied}
                        isHovered={isHovered}
                    />
                </Stack>
            ) : (
                <Typography color="text.secondary">{value ?? '-'}</Typography>
            )}
        </Stack>
    );
}
