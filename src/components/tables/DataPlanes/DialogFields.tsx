import type {
    DataPlaneDialogFieldProps,
    ToggleFieldProps,
} from 'src/components/tables/DataPlanes/types';

import { useState } from 'react';

import {
    Box,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from '@mui/material';

import { Check, Copy } from 'iconoir-react';

export function DataPlaneDialogField({
    label,
    value,
    showCopyButton = true,
}: DataPlaneDialogFieldProps) {
    const theme = useTheme();
    const [isCopied, setIsCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            });
        }
    };

    return (
        <Stack
            onClick={showCopyButton ? handleCopy : undefined}
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
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        transition: 'background-color 0.1s ease-in-out',
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 500,
                            fontFamily: 'Monospace',
                            fontSize: 12,
                            color: 'text.secondary',
                            lineHeight: 1,
                        }}
                    >
                        {value || '-'}
                    </Typography>
                    <Box
                        sx={{
                            position: 'relative',
                            width: 12,
                            height: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Check
                            style={{
                                position: 'absolute',
                                fontSize: 12,
                                color: theme.palette.success.main,
                                opacity: isCopied ? 1 : 0,
                                transition: 'opacity 0.1s ease-out',
                            }}
                        />
                        <Copy
                            style={{
                                position: 'absolute',
                                fontSize: 12,
                                color: theme.palette.text.disabled,
                                opacity: !isCopied && isHovered ? 1 : 0,
                                transition: 'opacity 0.1s ease-in',
                            }}
                        />
                    </Box>
                </Stack>
            ) : (
                <Typography color="text.secondary">{value || '-'}</Typography>
            )}
        </Stack>
    );
}

export function ToggleField({ label, options }: ToggleFieldProps) {
    const theme = useTheme();
    const [isCopied, setIsCopied] = useState(false);
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

    const handleCopy = () => {
        if (currentValue) {
            navigator.clipboard.writeText(currentValue).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            });
        }
    };

    if (validOptions.length === 0) {
        return null;
    }

    return (
        <Stack
            sx={{
                py: 1,
                cursor: currentValue ? 'pointer' : 'default',
            }}
            onClick={handleCopy}
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
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => setIsToggleHovered(true)}
                    onMouseLeave={() => setIsToggleHovered(false)}
                    size="small"
                >
                    {validOptions.map((opt) => (
                        <ToggleButton
                            key={opt.key}
                            value={opt.key}
                            sx={{ py: 0.25, px: 1, borderRadius: 3 }}
                        >
                            <Typography variant="caption">
                                {opt.label}
                            </Typography>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                    sx={{
                        fontWeight: 500,
                        fontFamily: 'Monospace',
                        fontSize: 12,
                        color: 'text.secondary',
                        lineHeight: 1,
                    }}
                >
                    {currentValue || '-'}
                </Typography>
                <Box
                    sx={{
                        position: 'relative',
                        width: 12,
                        height: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Check
                        style={{
                            position: 'absolute',
                            fontSize: 12,
                            color: theme.palette.success.main,
                            opacity: isCopied ? 1 : 0,
                            transition: 'opacity 0.1s ease-out',
                        }}
                    />
                    <Copy
                        style={{
                            position: 'absolute',
                            fontSize: 12,
                            color: theme.palette.text.disabled,
                            opacity:
                                !isCopied && isHovered && !isToggleHovered
                                    ? 1
                                    : 0,
                            transition: 'opacity 0.1s ease-in',
                        }}
                    />
                </Box>
            </Stack>
        </Stack>
    );
}
