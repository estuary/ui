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
    showCopyButton = true,
    onCopied,
    valueSx,
}: CopyValueFieldProps) {
    const { isCopied, handleCopy } = useCopyToClipboard();
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const copyValue = () => {
        void handleCopy(value)?.then((copied) => {
            if (copied) {
                onCopied?.();
            }
        });
    };

    return (
        <Stack
            component={showCopyButton ? 'button' : 'div'}
            type={showCopyButton ? 'button' : undefined}
            aria-label={showCopyButton ? `Copy ${label}` : undefined}
            onClick={showCopyButton ? copyValue : undefined}
            onFocus={showCopyButton ? () => setIsFocused(true) : undefined}
            onBlur={showCopyButton ? () => setIsFocused(false) : undefined}
            onMouseEnter={showCopyButton ? () => setIsHovered(true) : undefined}
            onMouseLeave={
                showCopyButton ? () => setIsHovered(false) : undefined
            }
            sx={{
                'width': '100%',
                'minWidth': 0,
                'px': 0,
                'py': 1,
                'border': 0,
                'background': 'none',
                'color': 'inherit',
                'font': 'inherit',
                'textAlign': 'left',
                'cursor': showCopyButton && value ? 'pointer' : 'default',
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            }}
        >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {label}
            </Typography>
            {showCopyButton ? (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ 'minWidth': 0, '& > :last-child': { flexShrink: 0 } }}
                >
                    <TechnicalEmphasis
                        sx={{
                            color: 'text.secondary',
                            fontSize: 12,
                            lineHeight: 1,
                            ...valueSx,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {value}
                    </TechnicalEmphasis>
                    <CopyIconIndicator
                        isCopied={isCopied}
                        isHovered={isHovered || isFocused}
                    />
                </Stack>
            ) : (
                <Typography color="text.secondary" noWrap>
                    {value ?? '-'}
                </Typography>
            )}
        </Stack>
    );
}
