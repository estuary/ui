import { Box, Button, Stack, Typography } from '@mui/material';

import { Developer, Plus } from 'iconoir-react';

import { defaultOutline, logoColors } from 'src/context/Theme';

interface EmptyStateProps {
    onQuickCreate: () => void;
    onGuidedCreate: () => void;
}

export function EmptyState({ onQuickCreate, onGuidedCreate }: EmptyStateProps) {
    return (
        <Stack
            sx={{
                alignItems: 'center',
                textAlign: 'center',
                px: 3,
                py: 9,
            }}
        >
            <Box
                sx={{
                    width: 88,
                    height: 88,
                    borderRadius: (theme) => theme.radius.xl,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    border: (theme) => defaultOutline[theme.palette.mode],
                    background: `linear-gradient(150deg, ${logoColors.purple}2e, ${logoColors.teal}24)`,
                    color: 'primary.main',
                }}
            >
                <Developer width={40} height={40} />
            </Box>

            <Typography variant="h6" sx={{ mb: 1.25 }}>
                No service accounts yet
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 440, mb: 3.5 }}>
                Create a non-login identity to give pipelines, agents and
                integrations scoped, programmatic access to your catalog — with
                API keys you can rotate and revoke anytime.
            </Typography>

            <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={onQuickCreate}
            >
                Create your first service account
            </Button>
        </Stack>
    );
}
