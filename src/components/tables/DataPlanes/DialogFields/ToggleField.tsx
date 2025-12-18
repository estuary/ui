import type { ToggleFieldProps } from 'src/components/tables/DataPlanes/types';

import { useState } from 'react';

import { Stack, ToggleButtonGroup, Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';

export function ToggleField({
    label,
    options,
    lowercaseButton,
}: ToggleFieldProps) {
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
            }}
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

            <SingleLineCode value={currentValue ?? '-'} />
        </Stack>
    );
}
