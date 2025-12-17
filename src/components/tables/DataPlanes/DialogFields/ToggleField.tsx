import type { ToggleFieldProps } from 'src/components/tables/DataPlanes/types';

import { useState } from 'react';

import { Stack, ToggleButtonGroup, Typography } from '@mui/material';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';

import CopyIconIndicator from 'src/components/tables/DataPlanes/DialogFields/CopyIconIndicator';

export function ToggleField({
    label,
    options,
    lowercaseButton,
}: ToggleFieldProps) {
    const { isCopied, handleCopy, setIsCopied } =
        useCopyToClipboard('ToggleField');
    const [isHovered, setIsHovered] = useState(false);
    const [isToggleHovered, setIsToggleHovered] = useState(false);

    const validOptions = options.filter((opt) => Boolean(opt.value));

    const [selectedKey, setSelectedKey] = useState<string>(
        validOptions[0]?.key ?? ''
    );

    const handleSelectionChange = (
        _event: React.MouseEvent<HTMLElement>,
        newKey: string | null
    ) => {
        if (newKey !== null) {
            setSelectedKey(newKey);
            setIsCopied(false);
        }
    };

    const currentOption = validOptions.find((opt) => opt.key === selectedKey);
    const currentValue = currentOption?.value ?? null;

    if (validOptions.length === 0) {
        return null;
    }

    return (
        <Stack
            sx={{
                py: 1,
                cursor: currentValue ? 'pointer' : 'default',
            }}
            onClick={() => handleCopy(currentValue)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    mb: 1,
                }}
            >
                <Typography variant="subtitle2" fontWeight={600}>
                    {label}
                </Typography>
                <ToggleButtonGroup
                    value={selectedKey}
                    exclusive
                    onChange={handleSelectionChange}
                    // prevent the ToggleButtonGroup from triggering copy on click
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => setIsToggleHovered(true)}
                    onMouseLeave={() => setIsToggleHovered(false)}
                    size="small"
                >
                    {validOptions.map((opt) => (
                        <OutlinedToggleButton key={opt.key} value={opt.key}>
                            <Typography
                                variant="caption"
                                sx={
                                    lowercaseButton
                                        ? { textTransform: 'none' }
                                        : undefined
                                }
                            >
                                {opt.label}
                            </Typography>
                        </OutlinedToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
                <TechnicalEmphasis
                    sx={{
                        color: 'text.secondary',
                        fontSize: 12,
                    }}
                >
                    {currentValue}
                </TechnicalEmphasis>
                <CopyIconIndicator
                    isCopied={isCopied}
                    isHovered={Boolean(isHovered && !isToggleHovered)}
                />
            </Stack>
        </Stack>
    );
}
