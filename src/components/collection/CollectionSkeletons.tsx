import { Box, Skeleton, Stack } from '@mui/material';

import { defaultOutline } from 'src/context/Theme';

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

interface DataGridRowSkeletonProps {
    opacity: number;
    contentWidth?: string | number;
    endButton?: boolean;
    showBorder?: boolean;
}

export function DataGridRowSkeleton({
    opacity,
    contentWidth,
    endButton,
    showBorder,
}: DataGridRowSkeletonProps) {
    return (
        <Stack
            direction="row"
            sx={{
                height: 52,
                borderBottom: showBorder
                    ? (theme) => defaultOutline[theme.palette.mode]
                    : undefined,
            }}
        >
            <Box
                sx={{
                    pl: '12px',
                    pr: 1,
                    py: '6px',
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'center',
                    opacity,
                }}
            >
                <Skeleton
                    width={contentWidth ?? '100%'}
                    variant="rectangular"
                />
            </Box>

            {endButton ? (
                <Box
                    sx={{
                        width: 52,
                        px: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity,
                    }}
                >
                    <Skeleton width="100%" variant="rectangular" />
                </Box>
            ) : null}
        </Stack>
    );
}
