import { Box, Skeleton } from '@mui/material';
import { semiTransparentBackground } from 'context/Theme';

function ExistingEntityCardSkeleton() {
    return (
        <Box
            sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                background: (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                borderRadius: 5,
            }}
        >
            <Skeleton
                variant="rounded"
                width={51}
                height={50}
                sx={{ borderRadius: 5 }}
            />

            <Box sx={{ ml: 2 }}>
                <Skeleton
                    variant="rectangular"
                    width={250}
                    height={16}
                    sx={{ mb: 1 }}
                />

                <Skeleton variant="rectangular" width={180} height={8} />
            </Box>
        </Box>
    );
}

export default ExistingEntityCardSkeleton;
