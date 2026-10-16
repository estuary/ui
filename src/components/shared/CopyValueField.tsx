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
    onCopied?: () => void;
    valueSx?: SystemStyleObject<Theme>;
}

/**
 * A labeled read-only value that copies itself: the whole field is the click
 * target, the copy icon fades in on hover, and a check confirms the copy in
 * place. Suits dense detail views where a button per value would be noise.
 */
export function CopyValueField({
    label,
    value,
    onCopied,
    valueSx,
}: CopyValueFieldProps) {
    const { isCopied, handleCopy } = useCopyToClipboard();
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const copyValue = () => {
        handleCopy(value);
        onCopied?.();
    };

    return (
        <Stack
            component="button"
            type="button"
            aria-label={`Copy ${label}`}
            onClick={copyValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                'cursor': value ? 'pointer' : 'default',
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
        </Stack>
    );
}
