import type { DataPlaneDialogFieldProps } from 'src/components/tables/DataPlanes/types';

import { useState } from 'react';

import { Stack, Typography } from '@mui/material';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';

import CopyIconIndicator from 'src/components/tables/DataPlanes/DialogFields/CopyIconIndicator';

export function DataPlaneDialogField({
    label,
    value,
    showCopyButton = true,
}: DataPlaneDialogFieldProps) {
    const { isCopied, handleCopy } = useCopyToClipboard('DataPlaneDialogField');
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Stack
            onClick={showCopyButton ? () => handleCopy(value) : undefined}
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
