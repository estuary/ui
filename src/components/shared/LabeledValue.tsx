import type { ReactNode } from 'react';

import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { InfoCircle } from 'iconoir-react';

import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';

export function LabeledValueGroup({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <Stack spacing={0.75}>
            <Typography component="h3" variant="subtitle2" fontWeight={600}>
                {title}
            </Typography>
            <Box
                component="dl"
                sx={{
                    'm': 0,
                    'px': 1.5,
                    'py': 0.25,
                    'border': 1,
                    'borderColor': 'divider',
                    'borderRadius': 1,
                    'bgcolor': 'action.hover',
                    '& > div + div': { borderTop: 1, borderColor: 'divider' },
                }}
            >
                {children}
            </Box>
        </Stack>
    );
}

interface LabeledValueProps {
    label: string;
    value: string | null;
    showCopyButton?: boolean;
    hint?: string;
}

export function LabeledValue({
    label,
    value,
    showCopyButton = true,
    hint,
}: LabeledValueProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                alignItems: 'center',
                gap: { xs: 0.25, sm: 1.5 },
                gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'minmax(125px, 29%) minmax(0, 1fr)',
                },
                minHeight: 36,
                py: 0.5,
            }}
        >
            <Typography
                component="dt"
                variant="body2"
                color="text.secondary"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                }}
            >
                {label}
                {hint ? (
                    <Tooltip
                        title={hint}
                        describeChild
                        arrow
                        enterTouchDelay={0}
                    >
                        <IconButton size="small" aria-label={`About ${label}`}>
                            <InfoCircle width={14} height={14} aria-hidden />
                        </IconButton>
                    </Tooltip>
                ) : null}
            </Typography>
            <Box
                component="dd"
                sx={{
                    m: 0,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 32px',
                    gap: 0.5,
                    alignItems: 'center',
                }}
            >
                <Typography
                    component="code"
                    variant="body2"
                    sx={{
                        fontFamily: 'monospace',
                        overflowWrap: 'anywhere',
                        justifySelf: { xs: 'start', sm: 'end' },
                    }}
                >
                    {value ?? 'None reported'}
                </Typography>
                {showCopyButton && value ? (
                    <CopyToClipboardButton
                        label={`Copy ${label}`}
                        writeValue={value}
                    />
                ) : null}
            </Box>
        </Box>
    );
}
