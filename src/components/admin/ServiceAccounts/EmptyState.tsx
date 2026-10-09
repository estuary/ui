import { Box, Button, Stack, Typography } from '@mui/material';

import { Planet, Plus } from 'iconoir-react';

import { featureDescription } from 'src/components/admin/ServiceAccounts/shared';
import { defaultOutline, logoColors } from 'src/context/Theme';

interface EmptyStateProps {
    onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
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
                <Planet width={40} height={40} />
            </Box>

            <Typography variant="h6" sx={{ mb: 1.25 }}>
                No service accounts yet
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 440, mb: 3.5 }}>
                {featureDescription}
            </Typography>

            <Button variant="contained" startIcon={<Plus />} onClick={onCreate}>
                Create your first service account
            </Button>
        </Stack>
    );
}
