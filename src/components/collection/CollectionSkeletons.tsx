import { Box, Skeleton } from '@mui/material';

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
