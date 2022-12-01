import { Box, Skeleton, Stack } from '@mui/material';

export function BindingsSelectorSkeleton() {
    return (
        <Box sx={{ p: 1 }}>
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />

            <Stack spacing={1}>
                <Skeleton variant="rectangular" />

                <Skeleton variant="rectangular" height={60} />

                <Skeleton variant="rectangular" height={60} />

                <Skeleton variant="rectangular" height={60} />
            </Stack>
        </Box>
    );
}

export function BindingsEditorConfigSkeleton() {
    return (
        <Box sx={{ p: 1 }}>
            <Skeleton
                variant="rectangular"
                height={40}
                width={250}
                sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 4 }}>
                <Skeleton variant="rectangular" sx={{ mb: 1 }} />

                <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />

                <Skeleton variant="rectangular" />
            </Box>

            <>
                <Skeleton variant="rectangular" sx={{ mb: 1 }} />

                <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />

                <Skeleton variant="rectangular" />
            </>
        </Box>
    );
}

export function BindingsEditorSchemaSkeleton() {
    return (
        <Box sx={{ p: 1 }}>
            <Skeleton variant="rectangular" width={50} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={250} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={300} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={350} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={300} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={250} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={50} />
        </Box>
    );
}
