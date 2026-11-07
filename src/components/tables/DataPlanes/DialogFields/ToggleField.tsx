import { useState } from 'react';

import { Stack, ToggleButtonGroup, Typography } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import SingleLineCode from 'src/components/content/SingleLineCode';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';

interface ToggleOption {
    key: string;
    label: string;
    value: string | null;
}

function AddressFamilyOption({
    option,
    lowercaseButton,
}: {
    option: ToggleOption;
    lowercaseButton?: boolean;
}) {
    const { ref } = useSemanticLeaf<HTMLButtonElement>(`Select ${option.key}`);
    return (
        <OutlinedToggleButton ref={ref} value={option.key}>
            <Typography
                variant="caption"
                sx={lowercaseButton ? { textTransform: 'none' } : undefined}
            >
                {option.label}
            </Typography>
        </OutlinedToggleButton>
    );
}

interface ToggleFieldProps {
    label: string;
    options: ToggleOption[];
    lowercaseButton?: boolean;
}

export function ToggleField({
    label,
    options,
    lowercaseButton,
}: ToggleFieldProps) {
    const { ref: semanticCopyIPAddressesRef } =
        useSemanticLeaf<HTMLButtonElement>('Copy IP Addresses');

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
                        <AddressFamilyOption
                            key={opt.key}
                            option={opt}
                            lowercaseButton={lowercaseButton}
                        />
                    ))}
                </ToggleButtonGroup>
            </Stack>

            <SingleLineCode
                copyButtonRef={semanticCopyIPAddressesRef}
                value={currentValue ?? '-'}
            />
        </Stack>
    );
}
